import { ApplicationCommandOptionType, ApplicationCommandType, ComponentType, InteractionResponseType, InteractionType, type APIInteraction, type APIMessageStringSelectInteractionData, type APIModalComponent, type APIModalSubmissionComponent } from "discord-api-types/v10"
import type { Method } from "axios"
import axios from "axios"
import { FunctCompiler } from "../functions/compiler"
import { FunctInternals } from "../functions/funct"
import { MissingContextError } from "../errors/builtin/missing-context"
import { InteractionInternals, type CordoInteraction } from "./interaction"
import { CordoMagic } from "./magic"
import type { LockfileInternals } from "./files/lockfile"
import type { ParsedCordoConfig } from "./files/config"
import { Hooks } from "./hooks"
import { RoutingResolve } from "./routing/resolve"
import { RoutingRespond } from "./routing/respond"


export namespace CordoGateway {

  export async function triggerInteraction(opts: {
    interaction: CordoInteraction | APIInteraction,
    httpCallback?: (payload: any) => any
    lockfile: LockfileInternals.ParsedLockfile
    config: ParsedCordoConfig
  }) {
    const rawInteraction = await Hooks.callHook('onRawInteraction', opts.interaction, undefined, opts.config)
    if (!rawInteraction) return

    if (rawInteraction.type === InteractionType.Ping)
      return handlePing(rawInteraction, opts.httpCallback)

    const interaction = InteractionInternals.upgrade(rawInteraction)
    const internals = InteractionInternals.get(interaction)

    if (opts.httpCallback) internals.httpCallback = opts.httpCallback

    CordoMagic.Internals.runWithCtx(() => handleInteraction(interaction), {
      invoker: interaction,
      lockfile: opts.lockfile,
      config: opts.config,
      cwd: '',
      idCounter: 0
    })
  }

  function handlePing(_i: CordoInteraction | APIInteraction, httpCallback?: (payload: any) => any) {
    httpCallback?.({ type: InteractionResponseType.Pong })
  }

  function apiRequest(method: Method, url: string, body?: Record<string, any>) {
    const config = CordoMagic.getConfig()
    if (!config)
      throw new MissingContextError('Could not make API request, no config found in context.')
    return axios({
      method,
      url,
      baseURL: config.upstream.baseUrl,
      data: body,
      validateStatus: null
    })
      .then(res => Hooks.callHook('onAfterRespond', res))
      .catch(res => Hooks.callHook('onNetworkError', res))
  }

  /** if the payload is null the interaction will be defered if not done already */
  export async function respondTo(i: CordoInteraction, payload: Record<string, any> | null) {
    payload = await Hooks.callHook('onBeforeRespond', payload, { interaction: i })

    const internals = InteractionInternals.get(i)
    if (internals.httpCallback && !internals.answered) {
      internals.answered = true

      if (payload)
        return internals.httpCallback(payload)

      if (i.type === InteractionType.ApplicationCommand)
        return internals.httpCallback({ type: InteractionResponseType.DeferredChannelMessageWithSource })

      if (i.type === InteractionType.MessageComponent)
        return internals.httpCallback({ type: InteractionResponseType.DeferredMessageUpdate })

      return null
    }

    if (!internals.answered) {
      if (payload)
        return apiRequest('post', `/interactions/${i.id}/${i.token}/callback`, payload)

      if (i.type === InteractionType.ApplicationCommand)
        return apiRequest('post', `/interactions/${i.id}/${i.token}/callback`, { type: InteractionResponseType.DeferredChannelMessageWithSource })

      if (i.type === InteractionType.MessageComponent)
        return apiRequest('post', `/interactions/${i.id}/${i.token}/callback`, { type: InteractionResponseType.DeferredMessageUpdate })
    }

    if (!payload)
      return null

    const { type, data } = payload
    if (!type || !data)
      return null

    const config = CordoMagic.getConfig()
    if (!config)
      throw new MissingContextError('Could not respond to interaction, no config found in context.')
    if (!config.client.id) {
      console.warn(`No client id provided in config. Cannot respond to interactions.`)
      return null
    }

    if (type === InteractionResponseType.ChannelMessageWithSource)
      return apiRequest('post', `/webhooks/${config.client.id}/${i.token}`, data)

    if (type === InteractionResponseType.UpdateMessage)
      return apiRequest('patch', `/webhooks/${config.client.id}/${i.token}/messages/@original`, data)

    return null
  }

  //

  async function handleInteraction(i: CordoInteraction) {
    i = await Hooks.callHook('onBeforeHandle', i)
    if (!i) return

    const config = CordoMagic.getConfig()
    if (!config)
      throw new MissingContextError('Could not handle interaction, no config found in context.')
    const deferAfter = config.upstream.autoDeferMs
    if (deferAfter) {
      setTimeout(() => {
        if (!InteractionInternals.get(i).answered)
          respondTo(i, null)
      }, deferAfter)
    }

    if (i.type === InteractionType.ApplicationCommand) 
      return handleCommandInteraction(i)
     else if (i.type === InteractionType.MessageComponent) 
      return handleComponentInteraction(i)
     else if (i.type === InteractionType.ModalSubmit) 
      return handleModalInteraction(i)
  }

  function handleCommandInteraction(i: CordoInteraction & { type: InteractionType.ApplicationCommand }) {
    // slash commands: need to check for subcommands
    if (i.data.type === ApplicationCommandType.ChatInput) {
      let name = i.data.name
      let option = i.data.options?.[0]
      while (option?.type === ApplicationCommandOptionType.Subcommand || option?.type === ApplicationCommandOptionType.SubcommandGroup) {
        name += ` ${option.name}`
        option = option.options?.[0]
      }

      const { route, path } = RoutingResolve.getRouteForCommand(name, 'slash')
      CordoMagic.setCwd(path)
      return RoutingRespond.callRoute(route.routeId, route.args, i)
    }

    // message/user commands: go ahead
    if (i.data.type === ApplicationCommandType.Message || i.data.type === ApplicationCommandType.User) {
      const { route, path } = RoutingResolve.getRouteForCommand(
        i.data.name,
        i.data.type === ApplicationCommandType.Message ? 'message' : 'user'
      )
      CordoMagic.setCwd(path)
      return RoutingRespond.callRoute(route.routeId, route.args, i)
    }
  }

  async function handleComponentInteraction(i: CordoInteraction & { type: InteractionType.MessageComponent }) {
    if (i.data.component_type === ComponentType.StringSelect) {
      const success = await parseAndEvokeComponentWithValues(i.data, i)
      if (!success)
        return
    }

    const id = i.data.custom_id
    const parsedCustomId = FunctCompiler.parseCustomId(id)

    if (parsedCustomId.cwd)
      CordoMagic.setCwd(parsedCustomId.cwd)

    if (!parsedCustomId.functs.length && !InteractionInternals.get(i).answered)
      await respondTo(i, null)

    for (const action of parsedCustomId.functs) {
      const success = await FunctInternals.evalFunct(action, i)
      if (!success)
        return
    }
  }

  async function handleModalInteraction(i: CordoInteraction & { type: InteractionType.ModalSubmit }) {
    const values = new Map<string, string>()
    for (const component of i.data.components) {
      const success = await parseAndEvokeModalLeafComponents(component, i, values)
      if (!success)
        return
    }
    // @ts-expect-error this type doesn't have a values property (yet)
    i.data.values = values

    const id = i.data.custom_id
    const parsedCustomId = FunctCompiler.parseCustomId(id)

    if (parsedCustomId.cwd)
      CordoMagic.setCwd(parsedCustomId.cwd)

    if (!parsedCustomId.functs.length && !InteractionInternals.get(i).answered)
      await respondTo(i, null)

    for (const action of parsedCustomId.functs) {
      const success = await FunctInternals.evalFunct(action, i)
      if (!success)
        return
    }
  }

  //

  async function parseAndEvokeModalLeafComponents(c: any, i: CordoInteraction, collectedFormItems: Map<string, unknown>): Promise<boolean> {
    if (c.type === ComponentType.ActionRow) {
      for (const item of c.components) {
        const success = await parseAndEvokeModalLeafComponents(item, i, collectedFormItems)
        if (!success)
          return false
      }
      return true
    }
    
    if (c.type === ComponentType.Label) {
      const success = await parseAndEvokeModalLeafComponents(c.component, i, collectedFormItems)
      return success
    }

    const parsedCustomId = FunctCompiler.parseCustomId(c.custom_id)
    if (!parsedCustomId.functs.length && !parsedCustomId.values.length)
      return true

    const formRef = parsedCustomId.values[0]

    if ('values' in c && c.values.length > 0 && typeof c.values[0] === 'string') {
      const success = await parseAndEvokeComponentWithValues(c, i)
      if (!success)
        return false

      if (formRef)
        collectedFormItems.set(formRef, c.values)
    } else if ('value' in c && typeof c.value === 'string') {
      const success = await parseAndEvokeComponentWithValue(c, i)
      if (!success)
        return false

      if (formRef)
        collectedFormItems.set(formRef, c.value)
    }

    return true
  }

  async function parseAndEvokeComponentWithValues(data: { values: string[] }, i: CordoInteraction): Promise<boolean> {
    const options = data.values.map(v => FunctCompiler.parseCustomId(v))
    data.values = options.flatMap(o => o.values)

    for (const option of options) {
      if (option.cwd)
        CordoMagic.setCwd(option.cwd)
      for (const action of option.functs) {
        const success = await FunctInternals.evalFunct(action, i)
        if (!success)
          return false
      }
    }

    return true
  }

  async function parseAndEvokeComponentWithValue(data: { value: string }, i: CordoInteraction): Promise<boolean> {
    const option = FunctCompiler.parseCustomId(data.value)
    data.value = option.values[0]

    if (option.cwd)
      CordoMagic.setCwd(option.cwd)
    for (const action of option.functs) {
      const success = await FunctInternals.evalFunct(action, i)
      if (!success)
        return false
    }

    return true
  }

}
