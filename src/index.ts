import * as fs from 'fs'
import * as path from 'path'
import { InteractionCommandHandler, InteractionComponentHandler, InteractionUIState, SlottedComponentHandler } from './types/custom'
import { InteractionCallbackType, InteractionComponentFlag, InteractionResponseFlags, InteractionType, InteractionCommandType } from './types/const'
import { CordoConfig, CustomLogger, GuildDataMiddleware, InteractionCallbackMiddleware, UserDataMiddleware, ApiResponseHandlerMiddleware } from './types/middleware'
import { CommandInteraction, ComponentInteraction, GenericInteraction } from './types/base'
import CordoAPI from './api'
import CordoReplies from './replies'
import DefaultLogger from './lib/default-logger'
import PermissionStrings from './lib/permission-strings'
import { parseParams } from './utils'


export * from './api'
export * from './replies'
export * from './lib/default-logger'
export * from './lib/permission-strings'
export * from './types/base'
export * from './types/component'
export * from './types/const'
export * from './types/custom'
export * from './types/middleware'
export default class Cordo {

  private static commandHandlers: { [command: string]: InteractionCommandHandler } = {}
  private static componentHandlers: { [command: string]: InteractionComponentHandler } = {}
  private static slottedComponentHandlers: SlottedComponentHandler[] = []
  private static uiStates: { [name: string]: InteractionUIState } = {}
  private static config: CordoConfig = {
    botId: null,
    texts: {
      interaction_not_owned_title: 'Nope!',
      interaction_not_owned_description: 'You cannot interact with Cordo widget as you did not create it. Run the command yourself to get a interactable widget.',
      interaction_not_permitted_title: 'No permission!',
      interaction_not_permitted_description_generic: 'You cannot do Cordo.',
      interaction_not_permitted_description_bot_admin: 'Only bot admins can do Cordo.',
      interaction_not_permitted_description_guild_admin: 'Only server admins.',
      interaction_not_permitted_description_manage_server: 'Only people with the "Manage Server" permission can do Cordo.',
      interaction_not_permitted_description_manage_messages: 'Only people with the "Manage Messages" permission can do Cordo.',
      interaction_failed: 'We are very sorry but an error occured while processing your command. Please try again.'
    }
  }
  
  private static logger: CustomLogger = new DefaultLogger()
  private static middlewares = {
    interactionCallback: [] as InteractionCallbackMiddleware[],
    fetchGuildData: null as GuildDataMiddleware,
    fetchUserData: null as UserDataMiddleware,
    apiResponseHandler: null as ApiResponseHandlerMiddleware
  }

  public static get _data() {
    return {
      config: Cordo.config,
      commandHandlers: Cordo.commandHandlers,
      componentHandlers: Cordo.componentHandlers,
      slottedComponentHandlers: Cordo.slottedComponentHandlers,
      uiStates: Cordo.uiStates,
      middlewares: Cordo.middlewares,
      logger: Cordo.logger,
      isBotOwner: Cordo.isBotOwner
    }
  }

  //

  public static init(config: CordoConfig) {
    if (!config.texts) config.texts = Cordo.config.texts
    Cordo.config = config

    if (config.contextPath) Cordo.findContext(config.contextPath)
    if (config.commandHandlerPath) Cordo.findCommandHandlers(config.commandHandlerPath)
    if (config.componentHandlerPath) Cordo.findComponentHandlers(config.componentHandlerPath)
    if (config.uiStatesPath) Cordo.findUiStates(config.uiStatesPath)
  }

  //

  public static registerCommandHandler(command: string, handler: InteractionCommandHandler) {
    if (Cordo.commandHandlers[command])
      Cordo.logger.warn(`Command handler for ${command} got assigned twice. Overriding.`)
    Cordo.commandHandlers[command] = handler
  }

  public static registerComponentHandler(id: string, handler: InteractionComponentHandler) {
    if (Cordo.componentHandlers[id])
      Cordo.logger.warn(`Component handler for ${id} got assigned twice. Overriding.`)
    Cordo.componentHandlers[id] = handler
    if (id.includes('$')) {
      this.slottedComponentHandlers.push({
        id,
        regex: new RegExp(id.replace(/\$[a-zA-Z0-9]+/g, '[a-zA-Z0-9]+')),
        handler
      })
    }
  }

  public static registerUiState(id: string, state: InteractionUIState) {
    if (Cordo.uiStates[id])
      Cordo.logger.warn(`UI State for ${id} already exists. Overriding.`)
    Cordo.uiStates[id] = state
  }

  public static findCommandHandlers(dir: string | string[], prefix?: string) {
    if (typeof dir !== 'string') dir = path.join(...dir)
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file)
      let fullName = (prefix ? prefix + '_' : '') + file.split('.')[0]
      while (fullName.endsWith('_')) fullName = fullName.substr(0, fullName.length - 1)

      if (file.includes('.')) {
        if (!file.endsWith('.js')) continue
        try {
          Cordo.registerCommandHandler(fullName, require(fullPath).default)
        } catch (ex) {
          console.error(ex)
        }
      } else {
        Cordo.findCommandHandlers(fullPath, fullName)
      }
    }
  }

  public static findComponentHandlers(dir: string | string[], prefix?: string) {
    if (typeof dir !== 'string') dir = path.join(...dir)
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file)
      let fullName = (prefix ? prefix + '_' : '') + file.split('.')[0]
      while (fullName.endsWith('_')) fullName = fullName.substr(0, fullName.length - 1)

      if (file.includes('.')) {
        if (!file.endsWith('.js')) continue
        Cordo.registerComponentHandler(fullName, require(fullPath).default)
      } else {
        Cordo.findComponentHandlers(fullPath, fullName)
      }
    }
  }

  public static findUiStates(dir: string | string[], prefix?: string) {
    if (typeof dir !== 'string') dir = path.join(...dir)
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file)
      let fullName = (prefix ? prefix + '_' : '') + file.split('.')[0]
      while (fullName.endsWith('_')) fullName = fullName.substr(0, fullName.length - 1)

      if (file.includes('.')) {
        if (!file.endsWith('.js')) continue
        Cordo.registerUiState(fullName, require(fullPath).default)
      } else {
        Cordo.findUiStates(fullPath, fullName)
      }
    }
  }

  public static findContext(dir: string | string[]) {
    if (typeof dir === 'string')
      dir = [ dir ]
    try {
      Cordo.findCommandHandlers([ ...dir, 'commands' ])
    } catch (ignore) {}
    try {
      Cordo.findComponentHandlers([ ...dir, 'components' ])
    } catch (ignore) {}
    try {
      Cordo.findUiStates([ ...dir, 'states' ])
    } catch (ignore) {}
  }

  public static updateBotId(newId: string) {
    Cordo.config.botId = newId
  }

  //

  public static addMiddlewareInteractionCallback(fun: InteractionCallbackMiddleware) {
    Cordo.middlewares.interactionCallback.push(fun)
  }

  public static setMiddlewareGuildData(fun: GuildDataMiddleware) {
    Cordo.middlewares.fetchGuildData = fun
  }

  public static setMiddlewareUserData(fun: UserDataMiddleware) {
    Cordo.middlewares.fetchUserData = fun
  }

  public static setMiddlewareApiResponseHandler(fun: ApiResponseHandlerMiddleware) {
    Cordo.middlewares.apiResponseHandler = fun
  }

  //

  public static async emitInteraction(i: GenericInteraction) {
    i._answered = false

    if (i.guild_id && !!Cordo.middlewares.fetchGuildData && typeof Cordo.middlewares.fetchGuildData === 'function') {
      i.guildData = Cordo.middlewares.fetchGuildData(i.guild_id)
      if (!!(i.guildData as any).then) i.guildData = await (i.guildData as any)
    }

    if (!i.user)
      i.user = i.member.user

    if (i.user.id && !!Cordo.middlewares.fetchUserData && typeof Cordo.middlewares.fetchUserData === 'function') {
      i.userData = Cordo.middlewares.fetchUserData(i.user.id)
      if (!!(i.userData as any).then) i.userData = await (i.userData as any)
    }

    if (i.type === InteractionType.COMMAND)
      Cordo.onCommand(i)
    else if (i.type === InteractionType.COMPONENT)
      Cordo.onComponent(i)
    else
      Cordo.logger.warn(`Unknown interaction type ${(i as any).type}`)
  }


  /*
   * INTERNAL
   */

  private static onCommand(i: CommandInteraction) {
    const name = i.data.name?.toLowerCase().replace(/ /g, '_').replace(/\W/g, '')
    try {
      i.data.option = {}
      for (const option of i.data.options || [])
        i.data.option[option.name] = option.value

      if (i.data.type === InteractionCommandType.USER)
        i.data.target = i.data.resolved.users[i.data.target_id]
      if (i.data.type === InteractionCommandType.MESSAGE)
        i.data.target = i.data.resolved.messages[i.data.target_id]

      if (Cordo.commandHandlers[name]) {
        Cordo.commandHandlers[name](CordoReplies.buildReplyableCommandInteraction(i))
      } else if (Cordo.uiStates[name + '_main']) {
        CordoReplies.buildReplyableCommandInteraction(i).state(name + '_main')
      } else {
        Cordo.logger.warn(`Unhandled command "${name}"`)
        CordoAPI.interactionCallback(i, InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE)
      }
    } catch (ex) {
      Cordo.logger.warn(ex)
      try {
        CordoAPI.interactionCallback(i, InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE, {
          content: Cordo.config.texts.interaction_failed,
          flags: InteractionResponseFlags.EPHEMERAL
        })
      } catch (ex) {
        Cordo.logger.warn(ex)
      }
    }
  }

  private static async componentPermissionCheck(i: ComponentInteraction): Promise<void | string> {
    if (await Cordo.isBotOwner(i.user.id))
      return 'passed'

    if (i.data.flags.includes(InteractionComponentFlag.ACCESS_BOT_ADMIN))
      return void Cordo.interactionNotPermitted(i, Cordo.config.texts.interaction_not_permitted_description_bot_admin)

    if (!i.data.flags.includes(InteractionComponentFlag.ACCESS_EVERYONE)) {
      const interactionOwner = i.message.interaction?.user

      if (interactionOwner?.id !== i.user.id) {
        return void Cordo.interactionNotOwned(
          i,
          i.message.interaction ? `/${i.message.interaction?.name}` : 'the command yourself',
          interactionOwner?.username || 'the interaction owner'
        )
      }
    }

    if (!i.member)
      return 'passed'

    if (i.data.flags.includes(InteractionComponentFlag.ACCESS_ADMIN) && !PermissionStrings.containsAdmin(i.member.permissions))
      return void Cordo.interactionNotPermitted(i, Cordo.config.texts.interaction_not_permitted_description_guild_admin)
    if (i.data.flags.includes(InteractionComponentFlag.ACCESS_MANAGE_SERVER) && !PermissionStrings.containsManageServer(i.member.permissions))
      return void Cordo.interactionNotPermitted(i, Cordo.config.texts.interaction_not_permitted_description_manage_server)
    if (i.data.flags.includes(InteractionComponentFlag.ACCESS_MANAGE_MESSAGES) && !PermissionStrings.containsManageMessages(i.member.permissions))
      return void Cordo.interactionNotPermitted(i, Cordo.config.texts.interaction_not_permitted_description_manage_messages)

    return 'passed'
  }

  private static async onComponent(i: ComponentInteraction) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [ contextId, _reserved, customId, flagsRaw ] = i.data.custom_id.includes(':')
      ? i.data.custom_id.split(':') // new format
      : [ null, null, i.data.custom_id.split('-')[0], i.data.custom_id.split('-')[1] ] // legacy

    i.data.custom_id = customId
    i.data.flags = flagsRaw?.split('') as InteractionComponentFlag[] ?? []

    if ((await Cordo.componentPermissionCheck(i)) !== 'passed') return

    const context = CordoReplies.activeInteractionReplyContexts.get(contextId)

    let regexSearchResult: SlottedComponentHandler | undefined
    if (context?.handlers?.[i.data.custom_id]) {
      context.handlers?.[i.data.custom_id](CordoReplies.buildReplyableComponentInteraction(i))
    } else if (regexSearchResult = context?.slottedHandlers?.find(h => h.regex.test(i.data.custom_id))) {
      const params = parseParams(regexSearchResult.id, i.data.custom_id)
      regexSearchResult.handler(CordoReplies.buildReplyableComponentInteraction(i, { params }))
    } else if (Cordo.componentHandlers[i.data.custom_id]) {
      Cordo.componentHandlers[i.data.custom_id](CordoReplies.buildReplyableComponentInteraction(i))
    } else if (regexSearchResult = Cordo.slottedComponentHandlers.find(h => h.regex.test(i.data.custom_id))) {
      const params = parseParams(regexSearchResult.id, i.data.custom_id)
      regexSearchResult.handler(CordoReplies.buildReplyableComponentInteraction(i, { params }))
    } else if (Cordo.uiStates[i.data.custom_id]) {
      CordoReplies.buildReplyableComponentInteraction(i).state()
    } else {
      if (!contextId)
        Cordo.logger.warn(`Unhandled component with custom_id "${i.data.custom_id}"`)
      CordoAPI.interactionCallback(i, InteractionCallbackType.DEFERRED_UPDATE_MESSAGE)
    }

    if (context?.onInteraction === 'restartTimeout') {
      clearTimeout(context.timeoutRunner)
      setTimeout(context.timeoutRunFunc, context.timeout)
    } else if (context?.onInteraction === 'triggerTimeout') {
      clearTimeout(context.timeoutRunner)
      context.timeoutRunFunc()
    } else if (context?.onInteraction === 'removeTimeout') {
      clearTimeout(context.timeoutRunner)
      context.timeoutRunFunc(true)
    }
  }

  private static interactionNotPermitted(i: GenericInteraction, text?: string): any {
    return CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, {
      title: Cordo.config.texts.interaction_not_permitted_title,
      description: text || Cordo.config.texts.interaction_not_permitted_description_generic,
      flags: InteractionResponseFlags.EPHEMERAL
    })
  }

  private static interactionNotOwned(i: GenericInteraction, command?: string, owner?: string): any {
    return CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, {
      title: Cordo.config.texts.interaction_not_owned_title,
      description: Cordo.config.texts.interaction_not_owned_description,
      flags: InteractionResponseFlags.EPHEMERAL,
      _context: { command, owner }
    })
  }

  private static isBotOwner(userid: string): boolean {
    if (!Cordo.config.botAdmins) return false

    if (typeof Cordo.config.botAdmins === 'function')
      return Cordo.config.botAdmins(userid)
    else
      return Cordo.config.botAdmins.includes(userid)
  }

}
