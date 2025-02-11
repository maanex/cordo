import { promises as fs } from "node:fs"
import { join } from "node:path"
import { InteractionResponseType, InteractionType, MessageFlags } from "discord-api-types/v10"
import { LibIds } from "../lib/ids"
import { isComponent, readComponent, type CordoComponent, type StringComponentType } from "../components/component"
import type { CordoModifier } from "../components/modifier"
import { LockfileInternals } from "./lockfile"
import { RouteInternals, type CordoRoute } from "./files/route"
import { InteractionInternals, type CordoInteraction } from "./interaction"
import { InteractionEnvironment } from "./interaction-environment"


export namespace Routes {

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
          path: file.path.join('/').replace(/\..+$/, ''),
          realPath: file.path.join('/'),
          impl: file.route
        })
      } else {
        const id = lockfile.reg.idCounter++
        const strId = LibIds.stringify(id, LockfileInternals.Const.idLength)
        out.push({
          name: strId,
          path: file.path.join('/').replace(/\..+$/, ''),
          realPath: file.path.join('/'),
          impl: file.route
        })
        lockfile.routes.push({
          name: strId,
          path: file.path.join('/').replace(/\..+$/, ''),
          realPath: file.path.join('/')
        })
      }
    }

    for (const item of out)
      lockfile.$runtime.routeImpls.set(item.name!, item)

    return out
  }

  //

  export function getRouteForCommand(command: string) {
    const routePath = `command/${command}`
    return {
      route: InteractionEnvironment.Utils.getRouteFromPath(routePath),
      path: routePath
    }
  }

  export async function callRoute(
    routeName: string,
    args: string[],
    i: CordoInteraction,
    opts: { asReply?: boolean, isPrivate?: boolean } = {}
  ): Promise<Record<string, any> | null> {
    const route = InteractionEnvironment.Utils.getRouteFromId(routeName)
    if (!route) return null

    const input = RouteInternals.buildRouteInput(route, args, i)
    const rendered = await route.impl.handler(input)

    const components: CordoComponent<StringComponentType>[] = []
    const modifiers: CordoModifier[] = []

    for (const item of rendered) {
      if (isComponent(item)) 
        components.push(item)
       else 
        modifiers.push(item)
    }

    //
    // TODO modifiers

    let type: InteractionResponseType = InteractionResponseType.Pong
    if (i.type === InteractionType.ApplicationCommand) {
      type = InteractionInternals.get(i).answered
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
        components: components.map(c => readComponent(c).render()),
        flags: (1 << 15) | (opts.isPrivate ? MessageFlags.Ephemeral : 0)
      }
    }
  }

}
