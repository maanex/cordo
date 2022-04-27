import * as fs from 'fs'
import * as path from 'path'
import Cordo from '..'
import CordoAPI from '../api'
import CordoReplies from '../replies'
import { ComponentInteraction } from '../types/base'
import { InteractionCallbackType, InteractionComponentFlag } from '../types/const'
import { InteractionComponentHandler, InteractionReplyContext, SlottedComponentHandler } from '../types/custom'
import PermissionChecks from '../lib/permission-checks'
import { parseParams } from '../lib/utils'
import CordoStatesManager from './states'


export default class CordoComponentsManager {
  
  public static readonly componentHandlers: Map<string, InteractionComponentHandler> = new Map()
  public static readonly slottedComponentHandlers: Set<SlottedComponentHandler> = new Set()

  //

  public static findComponentHandlers(dir: string | string[], prefix?: string) {
    if (typeof dir !== 'string') dir = path.join(...dir)
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file)
      let fullName = (prefix ? prefix + '_' : '') + file.split('.')[0]
      while (fullName.endsWith('_')) fullName = fullName.substring(0, fullName.length - 1)

      if (file.includes('.')) {
        if (!file.endsWith('.js')) continue
        CordoComponentsManager.registerComponentHandler(fullName, require(fullPath).default)
      } else {
        CordoComponentsManager.findComponentHandlers(fullPath, fullName)
      }
    }
  }

  public static registerComponentHandler(id: string, handler: InteractionComponentHandler) {
    if (CordoComponentsManager.componentHandlers.has(id))
      Cordo._data.logger.warn(`Component handler for ${id} got assigned twice. Overriding.`)

    CordoComponentsManager.componentHandlers.set(id, handler)

    if (id.includes('$')) {
      const regex = new RegExp('^' + id.replace(/\$[a-zA-Z0-9]+/g, '[a-zA-Z0-9]+') + '$')
      this.slottedComponentHandlers.add({ id, regex, handler })
    }
  }

  //

  public static async onComponent(i: ComponentInteraction) {
    const { contextId, customId, flagsRaw } = CordoAPI.parseCustomId(i.data.custom_id)

    i.data.custom_id = customId
    i.data.flags = flagsRaw?.split('') as InteractionComponentFlag[] ?? []

    if (!(await PermissionChecks.componentPermissionCheck(i))) return

    const context = CordoReplies.activeInteractionReplyContexts.get(contextId)

    CordoComponentsManager.findAndExecuteHandler(i, context)

    if (context)
      CordoComponentsManager.contextOnInteraction(context)
  }

  private static findAndExecuteHandler(i: ComponentInteraction, context: InteractionReplyContext) {
    let regexSearchResult: SlottedComponentHandler = null

    if (context?.handlers?.has(i.data.custom_id)) {
      const handler = context.handlers.get(i.data.custom_id)
      handler(CordoReplies.buildReplyableComponentInteraction(i))
      return
    }

    regexSearchResult = context?.slottedHandlers
      ? [ ...context.slottedHandlers.values() ]
        .find(h => h.regex.test(i.data.custom_id))
      : null

    if (regexSearchResult) {
      const params = parseParams(regexSearchResult.id, i.data.custom_id)
      regexSearchResult.handler(CordoReplies.buildReplyableComponentInteraction(i, { params }))
      return
    }

    if (CordoComponentsManager.componentHandlers.has(i.data.custom_id)) {
      const handler = CordoComponentsManager.componentHandlers.get(i.data.custom_id)
      handler(CordoReplies.buildReplyableComponentInteraction(i))
      return
    }

    regexSearchResult = [ ...CordoComponentsManager.slottedComponentHandlers.values() ]
      .find(h => h.regex.test(i.data.custom_id))

    if (regexSearchResult) {
      const params = parseParams(regexSearchResult.id, i.data.custom_id)
      regexSearchResult.handler(CordoReplies.buildReplyableComponentInteraction(i, { params }))
      return
    }

    if (CordoStatesManager.uiStates.has(i.data.custom_id)) {
      CordoReplies.buildReplyableComponentInteraction(i).state()
      return
    }

    if (!context?.id)
      Cordo._data.logger.warn(`Unhandled component with custom_id "${i.data.custom_id}"`)
    CordoAPI.interactionCallback(i, InteractionCallbackType.DEFERRED_UPDATE_MESSAGE)
  }

  private static contextOnInteraction(context: InteractionReplyContext) {
    if (context.onInteraction === 'restartTimeout') {
      clearTimeout(context.timeoutRunner)
      setTimeout(context.timeoutRunFunc, context.timeout)
      return
    }

    if (context.onInteraction === 'triggerTimeout') {
      clearTimeout(context.timeoutRunner)
      context.timeoutRunFunc()
      return
    }

    if (context.onInteraction === 'removeTimeout') {
      clearTimeout(context.timeoutRunner)
      context.timeoutRunFunc(true)
      return
    }
  }

}
