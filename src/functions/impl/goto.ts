import type { DynamicTypes } from "cordo"
import { FunctInternals, type CordoFunct } from "../funct"
import { CordoMagic } from "../../core/magic"
import { RoutingResolve } from "../../core/routing/resolve"
import { RoutingRespond } from "../../core/routing/respond"
import type { CordoInteraction } from "../../core"
import { CordoError } from "../../errors"
import { InteractionInternals } from "../../core/interaction"
import { HandleErrors } from "../../errors/handle"


export const Flags = {
  AsReply: 1 << 0,
  Private: 1 << 1,
  DisableComponents: 1 << 2,
}

export type FlagOpts = {
  asReply?: boolean,
  private?: boolean,
  disableComponents?: boolean
}

export function parseFlags(opts: FlagOpts | undefined, defaultValue = 0) {
  let flags = defaultValue
  if (opts?.asReply !== undefined)
    flags = (flags & ~Flags.AsReply) | (opts.asReply ? Flags.AsReply : 0)
  if (opts?.private !== undefined)
    flags = (flags & ~Flags.Private) | (opts.private ? Flags.Private : 0)
  if (opts?.disableComponents !== undefined)
    flags = (flags & ~Flags.DisableComponents) | (opts.disableComponents ? Flags.DisableComponents : 0)
  return flags
}

/** goto will open the route provided */
export function goto(
  path: DynamicTypes['Route'] | `./${string}` | '.' | '..' | `../${string}` | CordoFunct<'goto'>,
  opts?: FlagOpts
): CordoFunct<'goto'> {
  const usePath = FunctInternals.isFunct(path)
    ? FunctInternals.readFunct(path).path
    : path

  const flags = parseFlags(opts, FunctInternals.readFunct(path as any)?.flags ?? CordoMagic.getConfig()?.functDefaultFlags.gotoBits ?? 0)

  return FunctInternals.createFunct({
    type: 'goto',
    path: usePath,
    flags
  })
}

export async function evalGoto(path: string, flags: number, i: CordoInteraction): Promise<boolean> {
  const route = RoutingResolve.getRouteFromPath(path, true)
  CordoMagic.setCwd(path)

  const asReply = (flags & Flags.AsReply) !== 0
  const isPrivate = (flags & Flags.Private) !== 0
  const disableComponents = (flags & Flags.DisableComponents) !== 0

  try {
    await RoutingRespond.callRoute(route.routeId, route.args, i, { asReply, isPrivate, disableComponents })
  } catch (e) {
    if (e instanceof CordoError) {
      const parsedRoute = RoutingResolve.getRouteFromId(route.routeId)
      if (parsedRoute) {
        const opts: RoutingRespond.RouteOpts = InteractionInternals.get(i).answered
          ? {}
          : { asReply: true, isPrivate: true }
        const request = RoutingRespond.buildRouteRequest(parsedRoute, route.args, i, opts)
        if (request) {
          HandleErrors.thrownOnRoute(e, request)
          return true
        }
      }
    }

    HandleErrors.handleNonCordoError(e)
  }

  return true
}
