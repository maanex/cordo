import { MissingContextError } from "../../errors/builtin/missing-context"
import { Hooks } from "../hooks"
import type { CordoInteraction } from "../interaction"
import { CordoMagic } from "../magic"

const DefaultFileName = 'index'


export namespace RoutingResolve {

  function resolvePathDots(inputPath: string, startingPath: string) {
    if (!inputPath.startsWith('.')) return inputPath
    if (inputPath.startsWith('./')) return startingPath + inputPath.slice(1)

    const cwd = startingPath.split('/')
    if (cwd.at(-1) === DefaultFileName) cwd.pop()
    while (inputPath.startsWith('.')) {        
      if (inputPath.startsWith('..')) {
        if (cwd.length <= 0)
          return null

        cwd.pop()
        inputPath = inputPath.slice(2)
      } else if (inputPath.startsWith('.')) {
        inputPath = inputPath.slice(1)
      }

      if (inputPath.startsWith('.'))
        return null
      if (inputPath.startsWith('/'))
        inputPath = inputPath.slice(1)
    }

    return cwd.length
      ? (cwd.join('/') + '/' + inputPath)
      : inputPath
  }

  /**
   * cordo allows for runtime variables in route paths
   * these are inspired by bash
   * - $@ is the full value of the first argument
   * - $0, $1, $2, ... are the values of the first argument split by '/'
   */
  function substituteRuntimeVariables(args: string[], i: CordoInteraction) {
    return args.map((arg) => {
      if (arg.startsWith('$') && 'values' in i.data!) {
        if (arg === '$@')
          return i.data!.values[0]
        if (/^\$\d$/.test(arg))
          return i.data!.values[0].split('/')[parseInt(arg[1])] ?? ''
      }
      return arg
    })
  }

  //

  export function getRouteFromPath(path: string, resolveRuntimeVars: boolean) {
    const lockfile = CordoMagic.getLockfile()
    const invoker = CordoMagic.getInvoker()
    const currentRoute = CordoMagic.getCwd() ?? ''

    if (!lockfile)
      throw new MissingContextError('getRouteFromPath failed, no lockfile found in context.')
    if (!invoker)
      throw new MissingContextError('getRouteFromPath failed, no invoker found in context.')

    let startingPoint = currentRoute
    if (startingPoint.endsWith(DefaultFileName))
      startingPoint = startingPoint.slice(0, -DefaultFileName.length)
    if (startingPoint.endsWith('/') && startingPoint.length > 1)
      startingPoint = startingPoint.slice(0, -1)

    const start = resolvePathDots(path, startingPoint)
    if (start === null) {
      console.log('Invalid route', path)
      return { routeId: '####', args: [] }
    }

    const segments = start.split('/').filter(Boolean)
    let options = lockfile.routes.map(r => ({
      route: r,
      segments: r.path.split('/'),
      args: [] as string[],
      specificity: lockfile.$runtime.routeImpls.has(r.name!) ? 0 : -100 // penalize non-implemented routes
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

    return {
      routeId: winner.route.name!,
      args: resolveRuntimeVars
        ? substituteRuntimeVariables(winner.args, invoker)
        : winner.args,
      routeFilePath: winner.route.filePath
    }
  }

  export function getRouteForCommand(command: string) {
    const fileName = Hooks.isDefined('transformCommandName')
      ? Hooks.callHook('transformCommandName', command)
      : command.replaceAll(' ', '-').replace(/[^\w-]/g, '').toLowerCase()
    const routePath = `command/${fileName}`
    return {
      route: getRouteFromPath(routePath, false),
      path: routePath
    }
  }

  export function getRouteFromId(routeId: string) {
    return CordoMagic.getLockfile()?.$runtime.routeImpls.get(routeId)
  }

}
