import { ApplicationCommandType, ComponentType, InteractionResponseType, InteractionType, type APIInteraction } from "discord-api-types/v10"
import type { Method } from "axios"
import axios from "axios"
import { FunctCompiler } from "../functions/compiler"
import { FunctInternals } from "../functions/funct"
import { InteractionInternals, type CordoInteraction } from "./interaction"
import { CordoMagic } from "./magic"
import type { LockfileInternals } from "./files/lockfile"
import type { CordoConfig } from "./files/config"
import { Hooks } from "./hooks"
import { RoutingResolve } from "./routing/resolve"
import { RoutingRespond } from "./routing/respond"


export namespace CordoGateway {

  export async function triggerInteraction(opts: {
    interaction: CordoInteraction | APIInteraction,
    httpCallback?: (payload: any) => any
    lockfile: LockfileInternals.ParsedLockfile
    config: CordoConfig
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

    if (!payload)
      return null

    if (!internals.answered) 
      return apiRequest('post', `/interactions/${i.id}/${i.token}/callback`, payload)

    const { type, data } = payload
    if (!type || !data)
      return null

    const config = CordoMagic.getConfig()
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

    const deferAfter = CordoMagic.getConfig().upstream.autoDeferMs
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

  }

  function handleCommandInteraction(i: CordoInteraction & { type: InteractionType.ApplicationCommand }) {
    if (i.data.type === ApplicationCommandType.ChatInput) {
      const name = i.data.name
      const { route, path } = RoutingResolve.getRouteForCommand(name)
      CordoMagic.setCwd(path)
      return RoutingRespond.callRoute(route.routeId, route.args, i)
    }
  }

  async function handleComponentInteraction(i: CordoInteraction & { type: InteractionType.MessageComponent }) {
    const id = i.data.custom_id
    const parsedCustomId = FunctCompiler.parseCustomId(id)

    if (parsedCustomId.cwd)
      CordoMagic.setCwd(parsedCustomId.cwd)

    if (i.data.component_type === ComponentType.StringSelect) {
      const options = i.data.values.map(v => FunctCompiler.parseCustomId(v))
      i.data.values = options.map(o => o.values[0])

      for (const option of options) {
        for (const action of option.functs) {
          const success = await FunctInternals.evalFunct(action, i)
          if (!success) return
        }
      }
    }

    if (!parsedCustomId.functs.length && !InteractionInternals.get(i).answered)
      await respondTo(i, null)

    for (const action of parsedCustomId.functs) {
      const success = await FunctInternals.evalFunct(action, i)
      if (!success) return
    }
  }

}
