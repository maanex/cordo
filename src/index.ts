import * as fs from 'fs'
import * as path from 'path'
import { Client, GuildMember, Message, TextChannel } from 'discord.js'
import { InteractionApplicationCommandCallbackData, InteractionCommandHandler, InteractionComponentHandler, InteractionUIState } from './types/custom'
import { InteractionCallbackType, InteractionComponentFlag, InteractionResponseFlags, InteractionType } from './types/const'
import { CordoConfig, CustomLogger, GuildDataMiddleware, InteractionCallbackMiddleware, UserDataMiddleware } from './types/middleware'
import { CommandInteraction, ComponentInteraction, GenericInteraction, RichMessageInteraction } from './types/base'
import CordoAPI from './api'
import CordoReplies from './replies'
import DefaultLogger from './lib/default-logger'
import PermissionStrings from './lib/permission-strings'


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
    fetchUserData: null as UserDataMiddleware
  }

  public static get _data() {
    return {
      config: Cordo.config,
      commandHandlers: Cordo.commandHandlers,
      componentHandlers: Cordo.componentHandlers,
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
    if (config.commandHandlerPath) Cordo.findContext(config.commandHandlerPath)
    if (config.componentHandlerPath) Cordo.findContext(config.componentHandlerPath)
    if (config.uiStatesPath) Cordo.findContext(config.uiStatesPath)
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
        Cordo.registerCommandHandler(fullName, require(fullPath).default)
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
    Cordo.findCommandHandlers([ ...dir, 'commands' ])
    Cordo.findComponentHandlers([ ...dir, 'components' ])
    Cordo.findUiStates([ ...dir, 'states' ])
  }

  public static updateBotId(newId: string) {
    Cordo.config.botId = newId
  }

  public static updateBotClient(newClient: Client) {
    Cordo.config.botClient = newClient
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

  //

  public static sendRichReply(replyTo: Message, data: InteractionApplicationCommandCallbackData, mentionUser = true) {
    Cordo.sendRichMessage(replyTo.channel as TextChannel, replyTo.member, data, replyTo, mentionUser)
  }

  public static sendRichMessage(channel: TextChannel, member: GuildMember, data: InteractionApplicationCommandCallbackData, replyTo?: Message, mentionUser = true) {
    const fakeInteraction: RichMessageInteraction = {
      id: 'rich-message-' + Math.random().toString().substr(2),
      token: null,
      version: 0,
      user: {
        ...member.user,
        public_flags: 0
      },
      application_id: null,
      guildData: Cordo._data.middlewares.fetchGuildData?.(channel.guild.id),
      userData: Cordo._data.middlewares.fetchUserData?.(member.id),
      _answered: false,
      guild_id: channel.guild.id,
      channel_id: channel.id,
      member: {
        user: {
          ...member.user,
          public_flags: 0
        },
        roles: member.roles.cache.map(r => r.id),
        premium_since: null,
        permissions: member.permissions.bitfield + '',
        pending: false,
        nick: member.nickname,
        mute: false,
        joined_at: member.joinedAt.toISOString(),
        is_pending: false,
        deaf: false
      },
      type: InteractionType.RICH_MESSAGE
    }

    CordoAPI.normaliseData(data, fakeInteraction)
    if (replyTo) {
      (data as any).message_reference = {
        message_id: replyTo.id,
        guild_id: replyTo.guild.id,
        fail_if_not_exists: false
      }

      if (!mentionUser && !data.allowed_mentions)
        data.allowed_mentions = { parse: [] }
    }

    (channel.client as any).api.channels(channel.id).messages.post({ data })
  }


  /*
   * INTERNAL
   */


  private static onCommand(i: CommandInteraction) {
    try {
      for (const option of i.data.options || [])
        i.data.option[option.name] = option.value

      if (Cordo.commandHandlers[i.data.name]) {
        Cordo.commandHandlers[i.data.name](CordoReplies.buildReplyableCommandInteraction(i))
      } else if (Cordo.uiStates[i.data.name + '_main']) {
        CordoReplies.buildReplyableCommandInteraction(i).state(i.data.name + '_main')
      } else {
        Cordo.logger.warn(`Unhandled command "${i.data.name}"`)
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

    let interactionOwner = i.message.interaction?.user
    console.log(1, interactionOwner)
    console.log(2, JSON.stringify(i.message,null,2))
    console.log(3, Cordo.config.botClient)
    if (!interactionOwner && (i.message as any).message_reference && Cordo.config.botClient) {
      const reference = (i.message as any).message_reference
      const channel = await Cordo.config.botClient.channels.fetch(reference.channel_id) as TextChannel
      const message = await channel.messages.fetch(reference.message_id)
      console.log(4, message)
      interactionOwner = {
        ...message.author,
        public_flags: 0
      }
    }

    if (!i.data.flags.includes(InteractionComponentFlag.ACCESS_EVERYONE) && interactionOwner?.id !== i.user.id)
      return void Cordo.interactionNotOwned(i, i.message.interaction ? `/${i.message.interaction?.name}` : 'the command yourself', interactionOwner?.username || 'the interaction owner')

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
    i.data.flags = []
    if (i.data.custom_id.includes('-')) {
      const id = i.data.custom_id.split('-')[0]
      const flags = i.data.custom_id.substr(id.length + 1)
      i.data.custom_id = id
      i.data.flags = flags.split('-').join('').split('') as InteractionComponentFlag[]
    }

    if ((await Cordo.componentPermissionCheck(i)) !== 'passed') return

    const context = CordoReplies.findActiveInteractionReplyContext(i.message.interaction?.id)
    if (context?.resetTimeoutOnInteraction) {
      clearTimeout(context.timeoutRunner)
      setTimeout(context.timeoutRunFunc, context.timeout)
    }

    if (context?.handlers[i.data.custom_id]) {
      context.handlers[i.data.custom_id](CordoReplies.buildReplyableComponentInteraction(i))
    } else if (Cordo.componentHandlers[i.data.custom_id]) {
      Cordo.componentHandlers[i.data.custom_id](CordoReplies.buildReplyableComponentInteraction(i))
    } else if (Cordo.uiStates[i.data.custom_id]) {
      CordoReplies.buildReplyableComponentInteraction(i).state()
    } else {
      Cordo.logger.warn(`Unhandled component with custom_id "${i.data.custom_id}"`)
      CordoAPI.interactionCallback(i, InteractionCallbackType.DEFERRED_UPDATE_MESSAGE)
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
