import axios, { AxiosResponse } from 'axios'
import PermissionStrings from './lib/permission-strings'
import { InteractionApplicationCommandCallbackData, InteractionCallbackFollowup } from './types/custom'
import { GenericInteraction, InteractionLocationGuild } from './types/base'
import { InteractionResponseFlags } from './types/const'
import { MessageComponent } from './types/component'
import { ComponentType, InteractionCallbackType, InteractionComponentFlag } from './types/const'
import PermissionChecks from './lib/permission-checks'
import Cordo, { InteractionApplicationCommandAutocompleteCallbackData, InteractionDefferedCallbackData } from './index'

export default class CordoAPI {

  public static async interactionCallback(i: GenericInteraction, type: InteractionCallbackType.PONG): Promise<InteractionCallbackFollowup>
  public static async interactionCallback(i: GenericInteraction, type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data: InteractionApplicationCommandCallbackData, contextId?: string, useRaw?: boolean): Promise<InteractionCallbackFollowup>
  public static async interactionCallback(i: GenericInteraction, type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE, data?: InteractionDefferedCallbackData): Promise<InteractionCallbackFollowup>
  public static async interactionCallback(i: GenericInteraction, type: InteractionCallbackType.DEFERRED_UPDATE_MESSAGE, data?: InteractionDefferedCallbackData): Promise<InteractionCallbackFollowup>
  public static async interactionCallback(i: GenericInteraction, type: InteractionCallbackType.UPDATE_MESSAGE, data: InteractionApplicationCommandCallbackData, contextId?: string, useRaw?: boolean): Promise<InteractionCallbackFollowup>
  public static async interactionCallback(i: GenericInteraction, type: InteractionCallbackType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT, data: InteractionApplicationCommandAutocompleteCallbackData, contextId?: string, useRaw?: boolean): Promise<InteractionCallbackFollowup>
  public static async interactionCallback(i: GenericInteraction, type: InteractionCallbackType, data?: any, contextId?: string, useRaw?: boolean): Promise<InteractionCallbackFollowup> {
    if (!useRaw)
      CordoAPI.normaliseData(data, i, contextId)

    if (data?.components)
      i._answerComponents = data.components

    if (!i._answered) {
      i._answered = true
      if (!!i._httpCallback) {
        i._httpCallback({ type, data })
      } else {
        const res = await axios.post(`https://discord.com/api/v9/interactions/${i.id}/${i.token}/callback`, { type, data }, { validateStatus: null })
        CordoAPI.handleCallbackResponse(res, type, data)
      }
    } else {
      switch (type) {
        case InteractionCallbackType.PONG: break
        case InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: break
        case InteractionCallbackType.DEFERRED_UPDATE_MESSAGE: break
        case InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE: {
          const res = await axios.post(`https://discord.com/api/v9/webhooks/${Cordo._data.config.botId}/${i.token}`, data, { validateStatus: null })
          CordoAPI.handleCallbackResponse(res, type, data)
          break
        }
        case InteractionCallbackType.UPDATE_MESSAGE: {
          const res = await axios.patch(`https://discord.com/api/v9/webhooks/${Cordo._data.config.botId}/${i.token}/messages/@original`, data, { validateStatus: null })
          CordoAPI.handleCallbackResponse(res, type, data)
          break
        }
      }
    }

    return {
      async getMessage() {
        const res = await axios.get(`https://discord.com/api/v8/webhooks/${Cordo._data.config.botId}/${i.token}/messages/@original`, { validateStatus: null }) 
        if (res.status !== 200) return null
        return res.data
      },
      edit(editData: any, editUseRaw: boolean = useRaw) {
        CordoAPI.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, editData, contextId, editUseRaw)
      }
    }
  }

  private static handleCallbackResponse(res: AxiosResponse, type: number, data?: InteractionApplicationCommandCallbackData) {
    if (Cordo._data.middlewares.apiResponseHandler) {
      Cordo._data.middlewares.apiResponseHandler(res)
    } else if (res.status >= 300) {
      Cordo._data.logger.warn('Interaction callback failed with error:')
      Cordo._data.logger.warn(JSON.stringify(res.data, null, 2))
      Cordo._data.logger.warn('Request payload:')
      Cordo._data.logger.warn(JSON.stringify({ type, data }, null, 2))
    }
  }

  /**
   * Transforms the shorthand way of writing into proper discord api compatible objects
   */
  public static normaliseData(data: InteractionApplicationCommandCallbackData, i: GenericInteraction, contextId?: string) {
    if (!data) return
    // explicitly not using this. in this function due to unwanted side-effects in lambda functions
    Cordo._data.middlewares.interactionCallback.forEach(f => f(data, i))

    const isEmphemeral = (data.flags & InteractionResponseFlags.EPHEMERAL) !== 0

    if (!data.content)
      data.content = ''

    if (data.description || data.title) {
      if (!data.embeds) data.embeds = []
      data.embeds.push({
        title: data.title || undefined,
        description: data.description || undefined,
        footer: data.footer ? { text: data.footer } : undefined,
        image: data.image ? { url: data.image } : undefined,
        thumbnail: data.thumbnail ? { url: data.thumbnail } : undefined,
        color: data.color || 0x2F3136
      })
      delete data.description
      delete data.title
    }

    if (data.components?.length && (data.components[0].type as any) !== ComponentType.ROW) {
      const rows: MessageComponent[][] = []
      let newlineFlag = true
      for (const comp of data.components) {
        if (comp.visible === false) continue // === false to not catch any null or undefined

        if (comp.type !== ComponentType.LINE_BREAK && !!(comp as any).custom_id) {
          const hasAccessEveryoneFlag = comp.flags?.includes(InteractionComponentFlag.ACCESS_EVERYONE)
          if (isEmphemeral && !hasAccessEveryoneFlag) {
            if (!comp.flags) comp.flags = []
            comp.flags.push(InteractionComponentFlag.ACCESS_EVERYONE)
          }
          ;(comp as any).custom_id = `${contextId ?? ''}::${(comp as any).custom_id}:${comp.flags?.join('') ?? ''}`

          if (comp.flags?.length && !!(i as InteractionLocationGuild).member && !hasAccessEveryoneFlag) {
            const perms = BigInt((i as InteractionLocationGuild).member.permissions)
            if (comp.flags.includes(InteractionComponentFlag.ACCESS_ADMIN) && !PermissionStrings.containsAdmin(perms)) {
              if (comp.flags.includes(InteractionComponentFlag.HIDE_IF_NOT_ALLOWED)) comp.type = null
              else comp.disabled = true
            } else if (comp.flags.includes(InteractionComponentFlag.ACCESS_MANAGE_SERVER) && !PermissionStrings.containsManageServer(perms)) {
              if (comp.flags.includes(InteractionComponentFlag.HIDE_IF_NOT_ALLOWED)) comp.type = null
              else comp.disabled = true
            } else if (comp.flags.includes(InteractionComponentFlag.ACCESS_MANAGE_MESSAGES) && !PermissionStrings.containsManageMessages(perms)) {
              if (comp.flags.includes(InteractionComponentFlag.HIDE_IF_NOT_ALLOWED)) comp.type = null
              else comp.disabled = true
            } else if (comp.flags.includes(InteractionComponentFlag.ACCESS_BOT_ADMIN) && !PermissionChecks.isBotOwner(i.user.id)) {
              if (comp.flags.includes(InteractionComponentFlag.HIDE_IF_NOT_ALLOWED)) comp.type = null
              else comp.disabled = true
            }
          }
          delete comp.flags
        }

        switch (comp.type) {
          case ComponentType.LINE_BREAK: {
            if (rows[rows.length - 1].length)
              newlineFlag = true
            break
          }
          case ComponentType.BUTTON: {
            if (newlineFlag) rows.push([])
            newlineFlag = false

            if (comp.label?.length > 50)
              comp.label = comp.label.substr(0, 50)

            rows[rows.length - 1].push(comp)

            if (rows[rows.length - 1].length >= 5)
              newlineFlag = true
            break
          }
          case ComponentType.SELECT: {
            if (comp.options?.length > 50)
              comp.options.length = 50

            rows.push([ comp ])
            newlineFlag = true
          }
        }
      }
      data.components = rows.map(c => ({ type: ComponentType.ROW, components: c })) as any
    }
  }

}
