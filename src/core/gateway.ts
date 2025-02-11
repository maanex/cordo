import { ApplicationCommandType, InteractionResponseType, InteractionType, type APIInteraction } from "discord-api-types/v10"
import { InteractionInternals, type CordoInteraction } from "./interaction"
import { InteractionEnvironment } from "./interaction-environment"
import type { LockfileInternals } from "./lockfile"
import { Routes } from "./routes"
import { Flags, FunctInternals } from "./funct"


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
        const { route, path } = Routes.getRouteForCommand(name)
        InteractionEnvironment.getCtx().currentRoute = path
        const res = await Routes.callRoute(route.routeId, route.args, i)
        return respondTo(i, res)
      }
    } else if (i.type === InteractionType.MessageComponent) {
      const id = i.data.custom_id
      const actions = FunctInternals.parseCustomId(id)
      if (!actions.length)
        respondTo(i, { type: InteractionResponseType.DeferredMessageUpdate })

      for (const action of actions) {
        const funct = FunctInternals.readFunct(action)
        if (funct.type === 'run') continue // ignore for now

        if (funct.type === 'goto') {
          const route = InteractionEnvironment.Utils.getRouteFromPath(funct.path)
          InteractionEnvironment.getCtx().currentRoute = funct.path
          const asReply = (funct.flags & Flags.Goto.AsReply) !== 0
          const isPrivate = (funct.flags & Flags.Goto.Private) !== 0
          const res = await Routes.callRoute(route.routeId, route.args, i, { asReply, isPrivate })
          return respondTo(i, res)
        }
      }
    }
  }

}
