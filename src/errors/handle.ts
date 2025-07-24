import { CordoMagic } from "../core/magic"
import { RoutingResolve } from "../core/routing/resolve"
import type { CordoErrorHandler } from "../core/files/error-boundary"
import type { RouteRequest } from "../core"
import { CordoError } from "./cordo-error"


export namespace HandleErrors {

  function findApplicableBoundaries(startingPath: string) {
    const errorBounds = CordoMagic.getLockfile().$runtime.errorBoundaries
    const routeFilePath = RoutingResolve.getRouteFromPath(startingPath, false).routeFilePath!

    const options = errorBounds.map(b => ({
      impl: b.impl,
      segments: b.path.split('/').filter(Boolean),
      specificity: 0
    }))

    const matchSegments = routeFilePath.split('/').filter(Boolean)

    for (let i = 0; i < matchSegments.length; i++) {
      const segment = matchSegments[i]

      for (const opt of options) {
        if (opt.specificity === -1)
          continue
        else if (opt.segments.length <= i)
          continue
        else if (opt.segments[i] === segment)
          opt.specificity++
        else
          opt.specificity = -1
      }
    }

    return options
      .filter(o => o.specificity !== -1)
      .sort((a, b) => b.specificity - a.specificity)
  }

  function useDefaultHandler(error: CordoError) {
    console.trace('No error handler found for', error.name)
  }

  async function handleErrorStack(initialError: CordoError, handlers: CordoErrorHandler[], request: RouteRequest) {
    const handler = handlers.shift()
    if (!handler)
      return useDefaultHandler(initialError)

    try {
      await handler(initialError, request)
    } catch (error) {
      if (error instanceof CordoError)
        handleErrorStack(error, handlers, request)
      else
        handleNonCordoError(error)
    }
  }

  export function thrownOnRoute(error: CordoError, request: RouteRequest) {
    const currentRoute = CordoMagic.getCwd()

    const boundaries = findApplicableBoundaries(currentRoute)
    handleErrorStack(error, boundaries.map(b => b.impl.handler), request)
  }

  export function handleNonCordoError(error: any) {
    console.error('(dev) Non cordo error:')
    console.error(error)
  }

}
