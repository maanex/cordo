import * as fs from 'fs'
import * as path from 'path'
import Cordo from '..'
import CordoReplies from '../replies'
import { InteractionCommandAutocompleteHandler } from '../types/custom'
import { CommandAutocompleteInteraction } from '../types/base'
import CordoAPI from '../api'
import { InteractionCallbackType } from '../types/const'


export default class CordoAutocompleterManager {
  
  public static readonly autocompleteHandlers: Map<string, InteractionCommandAutocompleteHandler> = new Map()

  //

  public static findAutocompleteHandlers(dir: string | string[], prefix?: string) {
    if (typeof dir !== 'string') dir = path.join(...dir)
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file)
      let fullName = (prefix ? prefix + '_' : '') + file.split('.')[0]
      while (fullName.endsWith('_')) fullName = fullName.substring(0, fullName.length - 1)

      if (file.includes('.')) {
        if (!file.endsWith('.js') && !(process.versions.bun && file.endsWith('.ts'))) continue
        try {
          CordoAutocompleterManager.registerAutocompleteHandler(fullName, require(fullPath).default)
        } catch (ex) {
          console.error(ex)
        }
      } else {
        CordoAutocompleterManager.findAutocompleteHandlers(fullPath, fullName)
      }
    }
  }

  public static registerAutocompleteHandler(id: string, handler: InteractionCommandAutocompleteHandler) {
    if (CordoAutocompleterManager.autocompleteHandlers.has(id))
      Cordo._data.logger.warn(`Autocompleter for ${id} got assigned twice. Overriding.`)

    CordoAutocompleterManager.autocompleteHandlers.set(id, handler)
  }

  //

  public static onCommandAutocomplete(i: CommandAutocompleteInteraction) {
    const focused = i.data.options.find(o => o.focused)
    
    const name = `${i.data.name}_${focused?.name}`
      ?.toLowerCase()
      .replace(/ /g, '_')
      .replace(/\W/g, '')

    i.data.input = focused?.value ?? ''

    //

    if (CordoAutocompleterManager.autocompleteHandlers.has(name)) {
      const handler = CordoAutocompleterManager.autocompleteHandlers.get(name)
      handler(CordoReplies.buildReplyableCommandAutocompleteInteraction(i))
      return
    }

    Cordo._data.logger.warn(`Missing autocompleter for command "${name}"`)
    CordoAPI.interactionCallback(i, InteractionCallbackType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT, { choices: [] })
  }

}
