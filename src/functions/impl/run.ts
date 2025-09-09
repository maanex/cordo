import type { DynamicTypes } from "cordo"
import { FunctInternals, type CordoFunct } from "../funct"
import { RoutingResolve } from "../../core/routing/resolve"
import { type CordoInteraction } from "../../core"
import { RoutingRespond } from "../../core/routing/respond"
import { CordoError } from "../../errors"
import { HandleErrors } from "../../errors/handle"
import { CordoGateway } from "../../core/gateway"
import { CordoMagic } from "../../core/magic"


export const Flags = {
  Wait: 1 << 0,
  ContinueOnError: 1 << 1,
  PrivateErrorMessage: 1 << 2,
}

export type FlagOpts = {
  wait?: boolean
  continueOnError?: boolean
  privateErrorMessage?: boolean
}

export function parseFlags(opts: FlagOpts | undefined, defaultValue = 0) {
  let flags = defaultValue
  if (opts?.wait !== undefined)
    flags = (flags & ~Flags.Wait) | (opts.wait ? Flags.Wait : 0)
  if (opts?.continueOnError !== undefined)
    flags = (flags & ~Flags.ContinueOnError) | (opts.continueOnError ? Flags.ContinueOnError : 0)
  if (opts?.privateErrorMessage !== undefined)
    flags = (flags & ~Flags.PrivateErrorMessage) | (opts.privateErrorMessage ? Flags.PrivateErrorMessage : 0)
  return flags
}

/** run will execute code on the route provided.
 * if wait is false, the code will be executed in the background and the next action is taken or the interaction is ack'd
 * if wait is true, the next action will wait for this route to finish running. if this route throws an error the error will be shown and the next action will not be taken
 * 
 * continueOnError is only relevant when wait is set to true
 * if continueOnError is true, the next action will be taken even if the run route throws an error. the error will be presented to the user, see privateErrorMessage
 * if continueOnError is false, following actions will not execute and the error is rendered over the current route
 *
 * privateErrorMessage is only relevant when wait is set to true
 * if privateErrorMessage is true, the error will be rendered as an emphemeral reply message, regardless of continueOnError
 * if privateErrorMessage is false, the error will be hidden completely if continueOnError is true and will override the current route if continueOnError is false
 * 
 *                           | continueOnError true | continueOnError false
 * --------------------------|----------------------|----------------------------
 * privateErrorMessage true  | emphemeral reply     | emphemeral reply
 * privateErrorMessage false | no error message     | original message overridden
 * 
 */
export function run(
  path: DynamicTypes['Route'] | `./${string}` | '.' | '..' | `../${string}` | CordoFunct<'run'>,
  opts?: FlagOpts
): CordoFunct<'run'> {
  const usePath = FunctInternals.isFunct(path)
    ? FunctInternals.readFunct(path).path
    : path

  const flags = parseFlags(opts, FunctInternals.readFunct(path as any)?.flags ?? CordoMagic.getConfig()?.functDefaultFlags.runBits ?? 0)

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
  const privateErrorMessage = (flags & Flags.PrivateErrorMessage) !== 0

  try {
    const routeResponse = RoutingRespond.callRoute(route.routeId, route.args, i, { disableRendering: true })
    if (doWait)
      await routeResponse
    else
      routeResponse.catch(() => {})
    return true
  } catch (e) {
    if (e instanceof CordoError) {
      const parsedRoute = RoutingResolve.getRouteFromId(route.routeId)
      if (parsedRoute) {
        const opts: RoutingRespond.RouteOpts = privateErrorMessage
          ? { asReply: true, isPrivate: true }
          : continueOnError
            ? { disableRendering: true }
            : {}
        if (privateErrorMessage && continueOnError)
          CordoGateway.respondTo(i, null) // we'll ack this so that any rendering done further down does not spill into the new error message
        const request = RoutingRespond.buildRouteRequest(parsedRoute, route.args, i, opts)
        if (request) {
          HandleErrors.thrownOnRoute(e, request)
          return continueOnError
        }
      }
    }

    HandleErrors.handleNonCordoError(e)
    return continueOnError
  }

}
