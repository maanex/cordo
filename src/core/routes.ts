import { promises as fs } from "node:fs"
import { join } from "node:path"
import { InteractionResponseType, MessageFlags, ApplicationCommandType, ComponentType, InteractionContextType, InteractionType, type APIUser } from "discord-api-types/v10"
import { LibIds } from "../lib/ids"
import { isComponent, renderComponentList } from "../components/component"
import type { CordoModifier } from "../components/modifier"
import { disableAllComponents } from "../components/mods/disable-all-components"
import { LockfileInternals } from "./lockfile"
import { RouteInternals, type CordoRoute, type RouteRequest, type RouteResponse } from "./files/route"
import { InteractionInternals, type CordoInteraction } from "./interaction"
import { InteractionEnvironment } from "./interaction-environment"
import { CordoGateway } from "./gateway"
import { FunctInternals, goto, run } from "./funct"
import { Hooks } from "./hooks"


export namespace Routes {

  type RouteOpts = {
    asReply?: boolean
    isPrivate?: boolean
    disableComponents?: boolean
  }

  export const supportedExtensions = [ 'js', 'ts' ]

  export async function readFsTree(treeRoot: string, maxDepth = 20): Promise<{ path: string[]; route: CordoRoute }[]> {
    if (maxDepth <= 0) return []

    const out: Awaited<ReturnType<typeof readFsTree>> = []
    const dir = await fs.opendir(treeRoot)
    for await (const item of dir) {
      if (item.isDirectory()) {
        const subTree = await readFsTree(join(treeRoot, item.name), maxDepth - 1)
        for (const child of subTree) {
          out.push({
            path: [ item.name, ...child.path ],
            route: child.route
          })
        }
      } else if (item.isFile()) {
        if (!supportedExtensions.some(ext => item.name.endsWith(`.${ext}`)))
          continue

        const route = await RouteInternals.readRoute(join(treeRoot, item.name))
        if (!route)
          continue

        out.push({
          path: [ item.name ],
          route
        })
      }
    }

    return out
  }

  export async function readFsTreeAndSyncLockfile(treeRoot: string, lockfile: LockfileInternals.ParsedLockfile): Promise<RouteInternals.ParsedRoute[]> {
    const files = await readFsTree(treeRoot)

    const out: RouteInternals.ParsedRoute[] = []
    for (const file of files) {
      const fromLockfile = lockfile.routes.find(route => route.realPath === file.path.join('/'))

      if (fromLockfile) {
        out.push({
          name: fromLockfile.name,
          path: file.path.join('/').replace(/\.\w+$/, ''),
          realPath: file.path.join('/'),
          impl: file.route
        })
      } else {
        const id = lockfile.reg.idCounter++
        const strId = LibIds.stringify(id, LockfileInternals.Const.idLength)
        out.push({
          name: strId,
          path: file.path.join('/').replace(/\.\w+$/, ''),
          realPath: file.path.join('/'),
          impl: file.route
        })
        lockfile.routes.push({
          name: strId,
          path: file.path.join('/').replace(/\.\w+$/, ''),
          realPath: file.path.join('/')
        })
      }
    }

    for (const item of out)
      lockfile.$runtime.routeImpls.set(item.name!, item)

    return out
  }

  //

  export function buildRouteInput(
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

      ack: () => CordoGateway.respondTo(interaction, null),
      goto: (...args) => FunctInternals.evalFunct(goto(...args), interaction),
      render: (...response) => {
        const rendered = renderRouteResponse(response, interaction, opts)
        CordoGateway.respondTo(interaction, rendered)
      },
      run: (...args) => FunctInternals.evalFunct(run(...args), interaction) as Promise<RouteResponse>,

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

  export function getRouteForCommand(command: string) {
    const fileName = Hooks.isDefined('transformCommandName')
      ? Hooks.callHook('transformCommandName', command)
      : command.replaceAll(' ', '-').replace(/[^\w-]/g, '').toLowerCase()
    const routePath = `command/${fileName}`
    return {
      route: InteractionEnvironment.Utils.getRouteFromPath(routePath, false),
      path: routePath
    }
  }

  function renderRouteResponse(response: RouteResponse, i: CordoInteraction, opts: RouteOpts = {}) {
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

    InteractionEnvironment.Utils.resetIdCounter()
    return {
      type,
      data: {
        components: renderComponentList(response, null, [], {}),
        flags: (1 << 15) | (opts.isPrivate ? MessageFlags.Ephemeral : 0)
      }
    }
  }

  export async function callRoute(
    routeName: string,
    args: string[],
    i: CordoInteraction,
    opts: RouteOpts = {}
  ) {
    const route = InteractionEnvironment.Utils.getRouteFromId(routeName)
    if (!route) return

    const input = buildRouteInput(route, args, i, opts)
    if (!input) return

    const built = await route.impl.handler(input)
    if (!built) return

    const rendered = renderRouteResponse(built, i, opts)
    CordoGateway.respondTo(i, rendered)
  }

}
