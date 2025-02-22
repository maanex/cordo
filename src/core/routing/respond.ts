import { ComponentType, InteractionContextType, InteractionResponseType, InteractionType, MessageFlags, type APIUser } from "discord-api-types/v10"
import { disableAllComponents } from "../../components"
import { isComponent, renderComponentList } from "../../components/component"
import type { RouteInternals, RouteRequest, RouteResponse } from "../files/route"
import { InteractionInternals, type CordoInteraction } from "../interaction"
import { CordoMagic } from "../magic"
import { CordoGateway } from "../gateway"
import { FunctInternals } from "../../functions/funct"
import { goto, run } from "../../functions"
import type { CordoModifier } from "../../components/modifier"
import { RoutingResolve } from "./resolve"


export namespace RoutingRespond {

  type RouteOpts = {
    asReply?: boolean
    isPrivate?: boolean
    disableComponents?: boolean
    /** this is set to true for `run` tasks, they cannot change the screen */
    disableRendering?: boolean
  }

  const noOp = <T extends any> (response?: T) => (() => (response ?? {}) as T)

  //

  export function renderRouteResponse(response: RouteResponse, i: CordoInteraction, opts: RouteOpts = {}) {
    const modifiers: CordoModifier[] = []

    for (const item of response) {
      if (!isComponent(item)) 
        modifiers.push(item)
    }

    //
    // TODO modifiers

    if (opts.disableComponents)
      response.push(disableAllComponents())

    let type: InteractionResponseType = InteractionResponseType.Pong
    if (i.type === InteractionType.ApplicationCommand) {
      type = (InteractionInternals.get(i).answered && !opts.asReply)
        ? InteractionResponseType.UpdateMessage
        : InteractionResponseType.ChannelMessageWithSource
    } else if (i.type === InteractionType.MessageComponent) {
      type = opts.asReply
        ? InteractionResponseType.ChannelMessageWithSource
        : InteractionResponseType.UpdateMessage
    }

    CordoMagic.resetIdCounter()
    return {
      type,
      data: {
        components: renderComponentList(response, null, [], {}),
        flags: (1 << 15) | (opts.isPrivate ? MessageFlags.Ephemeral : 0)
      }
    }
  }

  export function buildRouteRequest(
    route: RouteInternals.ParsedRoute,
    args: string[],
    interaction: CordoInteraction,
    opts: RouteOpts = {}
): RouteRequest | null {
    const params = route.path
      .split('/')
      .filter(p => /^\[\w+\]$/.test(p))
      .map(p => p.slice(1, -1))
      .reduce((obj, name, idx) => ({ [name]: args[idx], ...obj }), {} as Record<string, string>)

    const location: RouteRequest['location'] | null = (interaction.context === InteractionContextType.Guild)
      ? 'guild'
      : (interaction.context === InteractionContextType.BotDM)
        ? 'direct'
        : (interaction.context === InteractionContextType.PrivateChannel)
          ? 'group'
          : null

    if (!location)
      return null

    const source: RouteRequest['source'] | null = (interaction.type === InteractionType.ApplicationCommand)
      ? 'command'
      : (interaction.type === InteractionType.MessageComponent)
        ? (interaction.data.component_type === ComponentType.Button)
          ? 'button'
          : (interaction.data.component_type === ComponentType.StringSelect)
            ? 'select'
            : null
      : null

    if (!source)
      return null

    const definiteUser: APIUser = interaction.member?.user ?? interaction.user!

    return {
      params,
      fullRoute: route.path.replace(/(\/|^)index$/, '') || '/',
      rawInteraction: interaction,
      rawEntitlements: interaction.entitlements,

      locals: {
        get: <T = any>(key: string) => interaction.locals[key] as T,
        set: (key: string, value: any) => void (interaction.locals[key] = value),
        delete: (key: string) => void (delete interaction.locals[key]),
        has: (key: string) => key in interaction.locals
      },

      ack: opts.disableRendering ? noOp : () => CordoGateway.respondTo(interaction, null),
      render: opts.disableRendering ? noOp : (...response) => {
        const rendered = renderRouteResponse(response, interaction, opts)
        CordoGateway.respondTo(interaction, rendered)
      },
      goto: opts.disableRendering ? noOp(Promise.resolve(null)) : (...args) => FunctInternals.evalFunct(goto(...args), interaction),
      run: opts.disableRendering ? noOp(Promise.resolve(null)) : (...args) => FunctInternals.evalFunct(run(...args), interaction),

      // @ts-ignore
      location,
      // @ts-ignore
      guild: (location === 'guild')
        ? {
          id: interaction.guild_id,
          data: interaction.guild,
          locale: interaction.guild_locale
        }
        : null,
      // @ts-ignore
      channel: (location === 'guild')
        ? {
          id: interaction.channel_id,
          data: interaction.channel
        }
        : null,
      user: {
        id: definiteUser.id,
        locale: interaction.user?.locale ?? (interaction as any).locale,
        data: definiteUser,
        // @ts-ignore
        member: (location === 'guild')
          ? interaction.member
          : null
      },

      // @ts-ignore
      source,
      // @ts-ignore
      command: (source === 'command')
        ? {
          // @ts-ignore
          name: interaction.data.name,
          // @ts-ignore
          id: interaction.data.id,
          // @ts-ignore
          options: interaction.data.options?.reduce((out, opt) => ({ [opt.name]: opt.value, ...out }), {}) ?? {},
          // @ts-ignore
          type: (interaction.data.type === ApplicationCommandType.ChatInput)
            ? 'chat'
            // @ts-ignore
            : (interaction.data.type === ApplicationCommandType.Message)
              ? 'message'
              // @ts-ignore
              : (interaction.data.type === ApplicationCommandType.User)
                ? 'user'
                : 'other',
          // @ts-ignore
          target: (interaction.data.type === ApplicationCommandType.Message || interaction.data.type === ApplicationCommandType.User)
            ? {
              // @ts-ignore
              id: interaction.data.target_id,
              // @ts-ignore
              data: interaction.data.resolved[interaction.data.type === ApplicationCommandType.Message ? 'messages' : 'users'][interaction.data.target_id]
            }
            : null
        }
        : null,
      selected: (source === 'select')
        // @ts-ignore
        ? interaction.data.values
        : null
    }
  }

  export async function callRoute(
    routeName: string,
    args: string[],
    i: CordoInteraction,
    opts: RouteOpts = {}
  ) {
    const route = RoutingResolve.getRouteFromId(routeName)
    if (!route) return

    const input = buildRouteRequest(route, args, i, opts)
    if (!input) return

    const built = await route.impl.handler(input)
    if (!built || typeof built === 'boolean') return

    const rendered = renderRouteResponse(built, i, opts)
    CordoGateway.respondTo(i, rendered)
  }

}
