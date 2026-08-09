import { promises as fs } from "node:fs"
import { join } from "node:path"
import { ErrorBoundaryInternals, type CordoErrorBoundary } from "../files/error-boundary"
import { RouteInternals, type CordoRoute } from "../files/route"
import { LockfileInternals } from "../files/lockfile"
import { LibIds } from "../../lib/ids"
import { CommandInternals, type CordoCommand } from "../files/command"
import type { ParsedCordoConfig } from "../files/config"


export namespace RoutingFilesystem {

  export const supportedExtensions = [ 'js', 'ts', 'mjs', 'mts' ]

  export type ParsedFsTree = {
    routes: Array<{ path: string[]; route: CordoRoute }>
    commands: Array<{ path: string[]; command: CordoCommand }>
    errorBounds: Array<{ path: string[]; boundary: CordoErrorBoundary }>
  }

  export async function readFsTree(treeRoot: string, config: ParsedCordoConfig, maxDepth = 20): Promise<ParsedFsTree> {
    const out: ParsedFsTree = {
      routes: [],
      commands: [],
      errorBounds: []
    }

    if (maxDepth <= 0)
      return out

    const dir = await fs.opendir(treeRoot)
    for await (const item of dir) {
      if (item.isDirectory()) {
        const subTree = await readFsTree(join(treeRoot, item.name), config, maxDepth - 1)
        for (const child of subTree.routes) {
          out.routes.push({
            path: [ item.name, ...child.path ],
            route: child.route
          })
        }
        for (const child of subTree.errorBounds) {
          out.errorBounds.push({
            path: [ item.name, ...child.path ],
            boundary: child.boundary
          })
        }
        for (const child of subTree.commands) {
          out.commands.push({
            path: [ item.name, ...child.path ],
            command: child.command
          })
        }
      } else if (item.isFile()) {
        if (!supportedExtensions.some(ext => item.name.endsWith(`.${ext}`)))
          continue

        const command = await CommandInternals.readCommand(join(treeRoot, item.name))
        if (command) {
          if (!treeRoot.includes(config.defaults.commandRoutePrefix ?? 'command'))
            console.warn(`File ${join(treeRoot, item.name)} defined a command but is not in the command route prefix folder (${config.defaults.commandRoutePrefix ?? 'command'}). The command will probably not trigger the configured route when run.`)

          out.commands.push({
            path: [ item.name ],
            command
          })

          if (typeof command.route !== 'string') {
            out.routes.push({
              path: [ item.name ],
              route: command.route
            })
          }
          continue
        }

        const route = await RouteInternals.readRoute(join(treeRoot, item.name))
        if (route) {
          out.routes.push({
            path: [ item.name ],
            route
          })
          continue
        }

        const errorBoundary = await ErrorBoundaryInternals.readHandler(join(treeRoot, item.name))
        if (errorBoundary) {
          out.errorBounds.push({
            path: [ item.name ],
            boundary: errorBoundary
          })
          continue
        }
      }
    }

    return out
  }

  export async function readFsTreeAndSyncLockfile(treeRoot: string, lockfile: LockfileInternals.ParsedLockfile, config: ParsedCordoConfig): Promise<RouteInternals.ParsedRoute[]> {
    const files = await readFsTree(treeRoot, config)

    const out: RouteInternals.ParsedRoute[] = []
    for (const file of files.routes) {
      const fromLockfile = lockfile.routes.find(route => route.filePath === file.path.join('/'))

      if (fromLockfile) {
        out.push({
          name: fromLockfile.name,
          path: file.path.join('/').replace(/\.\w+$/, ''),
          filePath: file.path.join('/'),
          impl: file.route
        })
      } else {
        const id = lockfile.reg.idCounter++
        const strId = LibIds.stringify(id, LockfileInternals.Const.idLength)
        out.push({
          name: strId,
          path: file.path.join('/').replace(/\.\w+$/, ''),
          filePath: file.path.join('/'),
          impl: file.route
        })
        lockfile.routes.push({
          name: strId,
          path: file.path.join('/').replace(/\.\w+$/, ''),
          filePath: file.path.join('/')
        })
      }
    }

    for (const item of out)
      lockfile.$runtime.routeImpls.set(item.name!, item)

    for (const file of files.errorBounds) {
      lockfile.$runtime.errorBoundaries.push({
        path: file.path.join('/').replace(/((\/|^)[^\/]+)?\.\w+$/, '') ?? '/',
        filePath: file.path.join('/'),
        impl: file.boundary
      })
    }

    for (const file of files.commands) {
      const filePath = file.path.join('/')
      lockfile.$runtime.registeredCommands.set(filePath, file.command)
    }

    return out
  }

}
