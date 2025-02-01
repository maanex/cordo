import * as fs from 'fs'
import * as path from 'path'
import Cordo from '..'
import CordoReplies from '../replies'
import { CommandInteraction } from '../types/base'
import { ApplicationCommandOptionType, InteractionCommandType } from '../types/const'
import { InteractionCommandHandler, SlottedCommandHandler } from '../types/custom'
import UserErrorMessages from '../lib/user-error-messages'
import { parseParams } from '../lib/utils'
import CordoStatesManager from './states'


export default class CordoCommandsManager {
  
  public static readonly commandHandlers: Map<string, InteractionCommandHandler> = new Map()
  public static readonly slottedCommandHandlers: Set<SlottedCommandHandler> = new Set()

  //

  public static async findCommandHandlers(dir: string | string[], prefix?: string) {
    if (typeof dir !== 'string') dir = path.join(...dir)
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file)
      let fullName = (prefix ? prefix + '_' : '') + file.split('.')[0]
      while (fullName.endsWith('_')) fullName = fullName.substring(0, fullName.length - 1)

      if (file.includes('.')) {
        if (!file.endsWith('.js') && !(process.versions.bun && file.endsWith('.ts'))) continue
        try {
          CordoCommandsManager.registerCommandHandler(fullName, (await import(fullPath)).default)
        } catch (ex) {
          console.error(ex)
        }
      } else {
        CordoCommandsManager.findCommandHandlers(fullPath, fullName)
      }
    }
  }

  public static registerCommandHandler(command: string, handler: InteractionCommandHandler) {
    if (CordoCommandsManager.commandHandlers.has(command))
      Cordo._data.logger.warn(`Command handler for ${command} got assigned twice. Overriding.`)

    CordoCommandsManager.commandHandlers.set(command, handler)
    
    if (command.includes('$')) {
      const regex = new RegExp('^' + command.replace(/\$[a-zA-Z0-9]+/g, '[a-zA-Z0-9]+') + '$')
      this.slottedCommandHandlers.add({ command, regex, handler })
    }
  }

  //

  public static onCommand(i: CommandInteraction) {
    let name = i.data.name?.toLowerCase().replace(/ /g, '_').replace(/\W/g, '')

    let type = i.data.options?.[0]?.type
    while (type === ApplicationCommandOptionType.SUB_COMMAND || type === ApplicationCommandOptionType.SUB_COMMAND_GROUP) {
      name += '_' + i.data.options[0].name.toLowerCase().replace(/ /g, '_').replace(/\W/g, '')
      i.data.options = i.data.options[0].options
      type = i.data.options[0]?.type
    }

    try {
      i.data.option = {}
      for (const option of i.data.options || [])
        i.data.option[option.name] = option.value

      //

      if (i.data.type === InteractionCommandType.USER)
        i.data.target = i.data.resolved.users[i.data.target_id]
      if (i.data.type === InteractionCommandType.MESSAGE)
        i.data.target = i.data.resolved.messages[i.data.target_id]

      //

      CordoCommandsManager.findAndExecuteHandler(name, i)
    } catch (ex) {
      this.onCommandFail(i, ex)
    }
  }

  private static findAndExecuteHandler(name: string, i: CommandInteraction) {
    if (CordoCommandsManager.commandHandlers.has(name)) {
      const handler = CordoCommandsManager.commandHandlers.get(name)
      handler(CordoReplies.buildReplyableCommandInteraction(i))
      return
    }
    
    const regexSearchResult = [ ...CordoCommandsManager.slottedCommandHandlers.values() ]
      .find(h => h.regex.test(name))

    if (regexSearchResult) {
      const params = parseParams(regexSearchResult.command, name)
      regexSearchResult.handler(CordoReplies.buildReplyableCommandInteraction(i, { params }))
      return
    }

    if (CordoStatesManager.getStateById(name + '_main')) {
      CordoReplies.buildReplyableCommandInteraction(i).state(name + '_main')
      return
    }

    Cordo._data.logger.warn(`Unhandled command "${name}"`)
    UserErrorMessages.interactionInvalid(i)
  }

  private static onCommandFail(i: CommandInteraction, ex: any) {
    Cordo._data.logger.warn(ex)
    try {
      UserErrorMessages.interactionFailed(i)
    } catch (ex) {
      Cordo._data.logger.warn(ex)
    }
  }

}
