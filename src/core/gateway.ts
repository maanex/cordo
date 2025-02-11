import { ApplicationCommandType, InteractionResponseType, InteractionType, type APIInteraction } from "discord-api-types/v10"
import { InteractionInternals, type CordoInteraction } from "./interaction"
import { InteractionEnvironment } from "./interaction-environment"
import type { LockfileInternals } from "./lockfile"
import { Routes } from "./routes"


export namespace CordoGateway {

  export function triggerInteraction(opts: {
    interaction: CordoInteraction | APIInteraction,
    httpCallback?: (payload: any) => any
    lockfile: LockfileInternals.ParsedLockfile
  }) {
    if (opts.interaction.type === InteractionType.Ping)
      return handlePing(opts.interaction, opts.httpCallback)

    const interaction = InteractionInternals.upgrade(opts.interaction)
    const internals = InteractionInternals.get(interaction)

    if (opts.httpCallback) internals.httpCallback = opts.httpCallback

    InteractionEnvironment.createNew(() => handleInteraction(interaction), {
      invoker: interaction,
      lockfile: opts.lockfile,
      currentRoute: '',
      idCounter: 0
    })
  }

  function handlePing(_i: CordoInteraction | APIInteraction, httpCallback?: (payload: any) => any) {
    httpCallback?.({ type: InteractionResponseType.Pong })
  }

  function respondTo(i: CordoInteraction, payload: any) {
    const internals = InteractionInternals.get(i)
    if (internals.httpCallback && !internals.answered) {
      internals.answered = true
      return internals.httpCallback(payload)
    }

    // TODO: send to discord
  }

  async function handleInteraction(i: CordoInteraction) {
    if (i.type === InteractionType.ApplicationCommand) {
      if (i.data.type === ApplicationCommandType.ChatInput) {
        const name = i.data.name
        const route = Routes.getRouteForCommand(name)
        const res = await Routes.callRoute(route.routeId, route.args, i)
        respondTo(i, res)
      }
    }
  }

}
