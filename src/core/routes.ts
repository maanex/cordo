import { promises as fs } from "node:fs"
import { join } from "node:path"
import { LibIds } from "../lib/ids"
import { LockfileInternals } from "./lockfile"
import { RouteInternals, type CordoRoute } from "./files/route"


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

        const route = RouteInternals.readRoute(join(treeRoot, item.name))
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
      const fromLockfile = lockfile.routes.find(route => route.path === file.path.join('/'))

      if (fromLockfile) {
        out.push({
          name: fromLockfile.name,
          path: file.path.join('/'),
          impl: file.route
        })
      } else {
        const id = lockfile.reg.idCounter++
        const strId = LibIds.stringify(id, LockfileInternals.Const.idLength)
        out.push({
          name: strId,
          path: file.path.join('/'),
          impl: file.route
        })
        lockfile.routes.push({
          name: strId,
          path: file.path.join('/')
        })
      }
    }

    return out
  }

}
