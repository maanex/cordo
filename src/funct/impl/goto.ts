import type { DynamicTypes } from "cordo"
import { FunctInternals, type CordoFunct } from "../funct"
import { CordoMagic } from "../../core/magic"
import { RoutingResolve } from "../../core/routing/resolve"
import { RoutingRespond } from "../../core/routing/respond"
import type { CordoInteraction } from "../../core"


export const Flags = {
  AsReply: 1 << 0,
  Private: 1 << 1,
  DisableComponents: 1 << 2,
}

/** goto will open the route provided */
export function goto(
  path: DynamicTypes['Route'] | `./${string}` | '.' | '..' | `../${string}` | CordoFunct<'goto'>,
  opts?: {
    asReply?: boolean,
    private?: boolean,
    disableComponents?: boolean
  }
): CordoFunct<'goto'> {
  const usePath = FunctInternals.isFunct(path)
    ? FunctInternals.readFunct(path).path
    : path

  let flags = FunctInternals.isFunct(path)
    ? FunctInternals.readFunct(path).flags
    : 0

  if (opts?.asReply !== undefined)
    flags = (flags & ~Flags.AsReply) | (opts.asReply ? Flags.AsReply : 0)
  if (opts?.asReply !== undefined)
    flags = (flags & ~Flags.AsReply) | (opts.asReply ? Flags.AsReply : 0)
  if (opts?.disableComponents !== undefined)
    flags = (flags & ~Flags.DisableComponents) | (opts.disableComponents ? Flags.DisableComponents : 0)

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

  await RoutingRespond.callRoute(route.routeId, route.args, i, { asReply, isPrivate, disableComponents })

  return true
}
