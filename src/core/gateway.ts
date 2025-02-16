import { ApplicationCommandType, InteractionResponseType, InteractionType, type APIInteraction } from "discord-api-types/v10"
import type { Method } from "axios"
import axios from "axios"
import { InteractionInternals, type CordoInteraction } from "./interaction"
import { InteractionEnvironment } from "./interaction-environment"
import type { LockfileInternals } from "./lockfile"
import { Routes } from "./routes"
import { FunctInternals } from "./funct"
import type { CordoConfig } from "./files/config"
import { Hooks } from "./hooks"


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

    InteractionEnvironment.createNew(() => handleInteraction(interaction), {
      invoker: interaction,
      lockfile: opts.lockfile,
      config: opts.config,
      currentRoute: '',
      idCounter: 0
    })
  }

  function handlePing(_i: CordoInteraction | APIInteraction, httpCallback?: (payload: any) => any) {
    httpCallback?.({ type: InteractionResponseType.Pong })
  }

  function apiRequest(method: Method, url: string, body?: Record<string, any>) {
    const config = InteractionEnvironment.getCtx().config
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

    const config = InteractionEnvironment.getCtx().config
    if (!config.client.id)
      return null

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

    if (i.type === InteractionType.ApplicationCommand) {
      if (i.data.type === ApplicationCommandType.ChatInput) {
        const name = i.data.name
        const { route, path } = Routes.getRouteForCommand(name)
        InteractionEnvironment.getCtx().currentRoute = path
        return Routes.callRoute(route.routeId, route.args, i)
      }
    } else if (i.type === InteractionType.MessageComponent) {
      const id = i.data.custom_id
      const actions = FunctInternals.parseCustomId(id)
      if (!actions.length)
        await respondTo(i, { type: InteractionResponseType.DeferredMessageUpdate })

      for (const action of actions) 
        await FunctInternals.evalFunct(action, i)
    }
  }

}
