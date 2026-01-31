import { CordoMagic } from "../core/magic"
import { RoutingResolve } from "../core/routing/resolve"
import type { CordoErrorHandler } from "../core/files/error-boundary"
import type { CordoInteraction, RouteRequest } from "../core"
import { Hooks } from "../core/hooks"
import { CordoError } from "./cordo-error"


export namespace HandleErrors {

  function findApplicableBoundaries(startingPath: string) {
    const errorBounds = CordoMagic.getLockfile()?.$runtime.errorBoundaries
    if (!errorBounds)
      return []

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

  function useDefaultHandler(error: Error, request?: RouteRequest) {
    if (Hooks.isDefined('captureUnhandledErrors')) {
      try {
        Hooks.callHook('captureUnhandledErrors', error, { request })
        return
      } catch {}
    }

    if (error instanceof CordoError)
      console.trace('No error handler found for', error.name)
    else
      throw error
  }

  async function handleErrorStack(initialError: Error, handlers: CordoErrorHandler[], request: RouteRequest) {
    const handler = handlers[0]
    if (!handler)
      return useDefaultHandler(initialError, request)

    try {
      await handler(initialError, request)
    } catch (error) {
      if (error instanceof Error)
        handleErrorStack(error, handlers.slice(1), request)
    }
  }

  export async function thrownOnRoute(error: Error, request: RouteRequest) {
    const currentRoute = CordoMagic.getCwd()

    const boundaries = findApplicableBoundaries(currentRoute)
    await handleErrorStack(error, boundaries.map(b => b.impl.handler), request)
  }

  export function handleUnroutableError(
    error: Error,
    invoker: {
      funct: 'goto' | 'run',
      path: string,
      flags: number,
      interaction: CordoInteraction
    }
  ) {
    if (Hooks.isDefined('captureUnroutableErrors')) {
      try {
        Hooks.callHook('captureUnroutableErrors', error, { invoker })
        return
      } catch {}
    }

    return useDefaultHandler(error)
  }

}
