import { verifyKeyMiddleware } from "discord-interactions"
import { Request, Response } from "express"
import { InteractionCallbackType, InteractionType } from './types/const'
import { CordoConfig, CustomLogger, GuildDataMiddleware, InteractionCallbackMiddleware, UserDataMiddleware, ApiResponseHandlerMiddleware } from './types/middleware'
import { GenericInteraction } from './types/base'
import CordoAPI from './api'
import DefaultLogger from './lib/default-logger'
import CordoCommandsManager from './manager/commands'
import CordoComponentsManager from './manager/components'
import CordoStatesManager from './manager/states'
import { InteractionCommandAutocompleteHandler, InteractionCommandHandler, InteractionComponentHandler, InteractionUIState } from "./types/custom"
import CordoAutocompleterManager from "./manager/autocompleter"


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

  private static __data = {
    config: {
      botId: null,
      texts: {
        interaction_not_owned_title: 'Nope!',
        interaction_not_owned_description: 'You cannot interact with this widget as you did not create it. Run the command yourself to get a interactable widget.',
        interaction_not_permitted_title: 'No permission!',
        interaction_not_permitted_description_generic: 'You cannot do this.',
        interaction_not_permitted_description_bot_admin: 'Only bot admins can do this.',
        interaction_not_permitted_description_guild_admin: 'Only for server admins.',
        interaction_not_permitted_description_manage_server: 'Only people with the "Manage Server" permission can do this.',
        interaction_not_permitted_description_manage_messages: 'Only people with the "Manage Messages" permission can dothis.',
        interaction_failed: 'We are very sorry but an error occured while processing your command. Please try again.',
        interaction_invalid_title: 'Error executing this command',
        interaction_invalid_description: 'The command was not found. Please contact the developer.'
      }
    } as CordoConfig,
    commandHandlers: CordoCommandsManager.commandHandlers,
    componentHandlers: CordoComponentsManager.componentHandlers,
    slottedComponentHandlers: CordoComponentsManager.slottedComponentHandlers,
    uiStates: CordoStatesManager.uiStates,
    middlewares: {
      interactionCallback: [] as InteractionCallbackMiddleware[],
      fetchGuildData: null as GuildDataMiddleware,
      fetchUserData: null as UserDataMiddleware,
      apiResponseHandler: null as ApiResponseHandlerMiddleware
    },
    logger: new DefaultLogger() as CustomLogger
  }

  public static get _data() {
    return Cordo.__data
  }

  //

  public static init(config: CordoConfig) {
    if (!config.texts) config.texts = Cordo._data.config.texts
    Cordo._data.config = config

    if (config.contextPath)
      Cordo.findContext(config.contextPath)
    if (config.commandHandlerPath)
      CordoCommandsManager.findCommandHandlers(config.commandHandlerPath)
    if (config.componentHandlerPath)
      CordoComponentsManager.findComponentHandlers(config.componentHandlerPath)
    if (config.uiStatesPath)
      CordoStatesManager.findUiStates(config.uiStatesPath)
    if (config.autocompleterPath)
      CordoAutocompleterManager.findAutocompleteHandlers(config.autocompleterPath)
  }

  //

  public static findContext(dir: string | string[]) {
    if (typeof dir === 'string')
      dir = [ dir ]
    try {
      CordoCommandsManager.findCommandHandlers([ ...dir, 'commands' ])
    } catch (ignore) {}
    try {
      CordoComponentsManager.findComponentHandlers([ ...dir, 'components' ])
    } catch (ignore) {}
    try {
      CordoStatesManager.findUiStates([ ...dir, 'states' ])
    } catch (ignore) {}
    try {
      CordoAutocompleterManager.findAutocompleteHandlers([ ...dir, 'autocompleter' ])
    } catch (ignore) {}
  }

  public static updateBotId(newId: string) {
    Cordo._data.config.botId = newId
  }

  //

  public static findCommandHandlers(dir: string | string[], prefix?: string) {
    CordoCommandsManager.findCommandHandlers(dir, prefix)
  }

  public static registerCommandHandler(command: string, handler: InteractionCommandHandler) {
    CordoCommandsManager.registerCommandHandler(command, handler)
  }

  public static findComponentHandlers(dir: string | string[], prefix?: string) {
    CordoComponentsManager.findComponentHandlers(dir, prefix)
  }

  public static registerComponentHandler(id: string, handler: InteractionComponentHandler) {
    CordoComponentsManager.registerComponentHandler(id, handler)
  }

  public static findUiStates(dir: string | string[], prefix?: string) {
    CordoStatesManager.findUiStates(dir, prefix)
  }

  public static registerUiState(id: string, state: InteractionUIState) {
    CordoStatesManager.registerUiState(id, state)
  }

  public static findAutocompleteHandlers(dir: string | string[], prefix?: string) {
    CordoAutocompleterManager.findAutocompleteHandlers(dir, prefix)
  }

  public static registerAutocompleteHandler(id: string, handler: InteractionCommandAutocompleteHandler) {
    CordoAutocompleterManager.registerAutocompleteHandler(id, handler)
  }

  //

  public static addMiddlewareInteractionCallback(fun: InteractionCallbackMiddleware) {
    Cordo._data.middlewares.interactionCallback.push(fun)
  }

  public static setMiddlewareGuildData(fun: GuildDataMiddleware) {
    Cordo._data.middlewares.fetchGuildData = fun
  }

  public static setMiddlewareUserData(fun: UserDataMiddleware) {
    Cordo._data.middlewares.fetchUserData = fun
  }

  public static setMiddlewareApiResponseHandler(fun: ApiResponseHandlerMiddleware) {
    Cordo._data.middlewares.apiResponseHandler = fun
  }

  //

  public static async emitInteraction(i: GenericInteraction) {
    i._answered = false

    if (Cordo._data.config.immediateDefer?.(i)) {
      if (i.type === InteractionType.COMMAND)
        CordoAPI.interactionCallback(i, InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE)
      else if (i.type === InteractionType.COMPONENT)
        CordoAPI.interactionCallback(i, InteractionCallbackType.DEFERRED_UPDATE_MESSAGE)
    }

    if (i.guild_id && !!Cordo._data.middlewares.fetchGuildData && typeof Cordo._data.middlewares.fetchGuildData === 'function') {
      i.guildData = Cordo._data.middlewares.fetchGuildData(i.guild_id)
      if (!!(i.guildData as any).then) i.guildData = await (i.guildData as any)
    }

    if (!i.user)
      i.user = i.member.user

    if (i.user.id && !!Cordo._data.middlewares.fetchUserData && typeof Cordo._data.middlewares.fetchUserData === 'function') {
      i.userData = Cordo._data.middlewares.fetchUserData(i.user.id)
      if (!!(i.userData as any).then) i.userData = await (i.userData as any)
    }

    if (i.type === InteractionType.COMMAND)
      CordoCommandsManager.onCommand(i)
    else if (i.type === InteractionType.COMPONENT)
      CordoComponentsManager.onComponent(i)
    else if (i.type === InteractionType.COMMAND_AUTOCOMPLETE)
      CordoAutocompleterManager.onCommandAutocomplete(i)
    else
      Cordo._data.logger.warn(`Unknown interaction type ${(i as any).type}`)
  }

  public static useWithExpress(clientPublicKey: string) {
    if (!clientPublicKey) 
      throw new Error('You must specify a Discord client public key');
  
    const checkKey = verifyKeyMiddleware(clientPublicKey)
  
    return (req: Request, res: Response) => {
      checkKey(req, res, () => {
        const interaction = req.body as GenericInteraction
        interaction._httpCallback = (payload: any) => res.status(200).json(payload)
        Cordo.emitInteraction(interaction)
      })
    }
  }

}
