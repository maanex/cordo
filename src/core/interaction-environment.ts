import { AsyncLocalStorage } from 'async_hooks'
import { LibIds } from '../lib/ids'
import type { CordoInteraction } from './interaction'
import type { LockfileInternals } from './lockfile'


type Context = {
  currentRoute: string
  lockfile: LockfileInternals.ParsedLockfile
  invoker: CordoInteraction
  idCounter: number
}

export namespace InteractionEnvironment {

  const DefaultFileName = 'index'

  const als = new AsyncLocalStorage<Context>()

  export function createNew(fn: () => any, ctx: Context) {
    als.run(ctx, fn)
  }

  export function getCtx() {
    return als.getStore()!
  }

  //

  export namespace Utils {

    function resolvePathDots(path: string, currentRoute: string) {
      if (!path.startsWith('.')) return path
      if (path.startsWith('./')) return currentRoute + path.slice(1)

      const cwd = currentRoute.split('/')
      if (cwd.at(-1) === DefaultFileName) cwd.pop()
      while (path.startsWith('.')) {        
        if (path.startsWith('..')) {
          if (cwd.length <= 0)
            return null

          cwd.pop()
          path = path.slice(2)
        } else if (path.startsWith('.')) {
          path = path.slice(1)
        }

        if (path.startsWith('.'))
          return null
        if (path.startsWith('/'))
          path = path.slice(1)
      }

      return cwd.length
        ? (cwd.join('/') + '/' + path)
        : path
    }

    export function getRouteFromPath(path: string) {
      const { lockfile, currentRoute } = getCtx()
      console.log('--->', path)
      console.log('...', currentRoute)

      const start = resolvePathDots(path, currentRoute)
      if (start === null) {
        console.log('Invalid route', path)
        return { routeId: '####', args: [] }
      }
      console.debug('Start:', start)

      const segments = start.split('/').filter(Boolean)
      let options = lockfile.routes.map(r => ({
        route: r,
        segments: r.path.split('/'),
        args: [] as string[],
        specificity: 0
      }))

      for (let segmentIdx = 0; segmentIdx < segments.length; segmentIdx++) {
        const seg = segments[segmentIdx]
        options = options.filter((o) => {
          if (o.segments.length <= segmentIdx) {
            return false
          } else if (o.segments[segmentIdx] === seg) {
            o.specificity++
            return true
          } else if (o.segments[segmentIdx].startsWith('[') && o.segments[segmentIdx].endsWith(']')) {
            o.args.push(seg)
            return true
          } else {
            return false
          }
        })
        if (!options.length)
          break
      }

      options = options.filter((o) => {
        if (o.segments.length === segments.length) {
          o.specificity++
          return true
        } else if (o.segments.length === segments.length + 1) {
          return (o.segments.at(-1) === DefaultFileName)
        } else {
          return false
        }
      })

      if (options.length === 0) {
        console.log('Could not find route', path, '(', path, ')')
        return { routeId: '####', args: [] }
      }

      const maxSpecificity = Math.max(...options.map(o => o.specificity))
      const winner = options.find(o => o.specificity === maxSpecificity)!

      console.debug('Winner:', winner.route.realPath, `(${winner.specificity})`)

      return {
        routeId: winner.route.name!,
        args: winner.args
      }
    }

    export function getRouteFromId(routeId: string) {
      return getCtx().lockfile.$runtime.routeImpls.get(routeId)
    }

    export function resetIdCounter() {
      return getCtx().idCounter = 0
    }

    export function requestNewId<T extends boolean>(asString: T): T extends true ? string : number {
      const id = ++getCtx().idCounter
      if (!asString) return id as any
      return LibIds.stringify(id, 1) as any
    }

  }

}
