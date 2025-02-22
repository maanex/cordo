import type { DynamicTypes } from "cordo"
import { FunctInternals, type CordoFunct } from "../funct"
import { RoutingResolve } from "../../core/routing/resolve"
import type { CordoInteraction } from "../../core"
import { RoutingRespond } from "../../core/routing/respond"
import { CordoError } from "../../errors"
import { HandleErrors } from "../../errors/handle"


export const Flags = {
  Wait: 1 << 0,
  ContinueOnError: 1 << 1
}

/** run will execute code on the route provided.
 * if wait is false, the code will be executed in the background and the next action is taken or the interaction is ack'd
 * if wait is true, the next action will wait for this route to finish running. if this route throws an error the error will be shown and the next action will not be taken
 * 
 * continueOnError is only relevant when wait is set to true
 * if continueOnError is true, the next action will be taken even if the run route throws an error. the error will be presented in an emphemeral response
 * if continueOnError is false, following actions will not execute and the error is rendered over the current route
 */
export function run(
  path: DynamicTypes['Route'] | `./${string}` | '.' | '..' | `../${string}` | CordoFunct<'run'>,
  opts?: {
    wait?: boolean
    continueOnError?: boolean
  }
): CordoFunct<'run'> {
  const usePath = FunctInternals.isFunct(path)
    ? FunctInternals.readFunct(path).path
    : path

  let flags = FunctInternals.isFunct(path)
    ? FunctInternals.readFunct(path).flags
    : 0

  if (opts?.wait !== undefined)
    flags = (flags & ~Flags.Wait) | (opts.wait ? Flags.Wait : 0)
  if (opts?.continueOnError !== undefined)
    flags = (flags & ~Flags.ContinueOnError) | (opts.continueOnError ? Flags.ContinueOnError : 0)

  return FunctInternals.createFunct({
    type: 'run',
    path: usePath,
    flags
  })
}

export async function evalRun(path: string, flags: number, i: CordoInteraction): Promise<boolean> {
  const route = RoutingResolve.getRouteFromPath(path, true)
  const doWait = (flags & Flags.Wait) !== 0
  const continueOnError = (flags & Flags.ContinueOnError) !== 0

  try {
    const routeResponse = RoutingRespond.callRoute(route.routeId, route.args, i, { disableRendering: true })
    if (doWait)
      await routeResponse
    return true
  } catch (e) {
    if (e instanceof CordoError)
      HandleErrors.thrownOnRoute(e)
     else 
      console.error(e)

    return continueOnError
  }

}
