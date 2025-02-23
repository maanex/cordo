import { promises as fs } from "node:fs"
import { join } from "node:path"
import { ErrorBoundaryInternals, type CordoErrorBoundary } from "../files/error-boundary"
import { RouteInternals, type CordoRoute } from "../files/route"
import { LockfileInternals } from "../files/lockfile"
import { LibIds } from "../../lib/ids"


export namespace RoutingFilesystem {

  export const supportedExtensions = [ 'js', 'ts' ]

  export type ParsedFsTree = {
    routes: Array<{ path: string[]; route: CordoRoute }>
    errorBounds: Array<{ path: string[]; boundary: CordoErrorBoundary }>
  }

  export async function readFsTree(treeRoot: string, maxDepth = 20): Promise<ParsedFsTree> {
    const out: ParsedFsTree = {
      routes: [],
      errorBounds: []
    }

    if (maxDepth <= 0)
      return out

    const dir = await fs.opendir(treeRoot)
    for await (const item of dir) {
      if (item.isDirectory()) {
        const subTree = await readFsTree(join(treeRoot, item.name), maxDepth - 1)
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
      } else if (item.isFile()) {
        if (!supportedExtensions.some(ext => item.name.endsWith(`.${ext}`)))
          continue

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

  export async function readFsTreeAndSyncLockfile(treeRoot: string, lockfile: LockfileInternals.ParsedLockfile): Promise<RouteInternals.ParsedRoute[]> {
    const files = await readFsTree(treeRoot)

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

    return out
  }

}
