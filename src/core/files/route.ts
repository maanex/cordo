import { type APIEntitlement, type APIInteractionGuildMember, type APIMessage, type APIPartialChannel, type APIPartialGuild, type APIUser } from "discord-api-types/v10"
import type { CordoComponent, StringComponentType } from "../../components/component"
import type { CordoInteraction } from "../interaction"
import type { CordoModifier } from "../../components/modifier"
import type { goto, run } from "../funct"
import { CordoErrorRouteAssumptionFailed } from "../../errors"


const CordoRoute = Symbol('CordoRoute')

export type RouteResponse = Array<CordoComponent<StringComponentType> | CordoModifier>

type RouteRequestInGuild = {
  location: 'guild'
  guild: {
    id: string
    data: APIPartialGuild
    locale: string
  }
  channel: {
    id: string
    data: APIPartialChannel
  }
  user: {
    id: string
    locale: string
    data: APIUser
    member: APIInteractionGuildMember
  }
}

type RouteRequestInDM = {
  location: 'direct' | 'group'
  guild: null
  channel: null
  user: {
    id: string
    locale: string
    data: APIUser
    member: null
  }
}

type RouteRequestFromCommand = {
  source: 'command'
  command: {
    name: string
    id: string
    options: Record<string, string | number | boolean>
  } & (
    {
      type: 'chat'
      target: null
    } | {
      type: 'message'
      target: {
        id: string
        data: APIMessage
      }
    } | {
      type: 'user'
      target: {
        id: string
        data: APIUser
      }
    } | {
      type: 'other'
      target: null
    }
  )
  selected: null
}

type RouteRequestFromButton = {
  source: 'button'
  command: null
  selected: null
}

type RouteRequestFromSelect = {
  source: 'select'
  command: null
  selected: string[]
}

export type RouteRequest = {
  params: Record<string, string>
  fullRoute: string
  rawInteraction: CordoInteraction

  /** this has the prefix raw because a cleaner representation of this data is planned */
  rawEntitlements: APIEntitlement[]

  /** acknowledge the request but only provide a reply later */
  ack: () => void
  /** render the provided components */
  render: (...response: RouteResponse) => void
  /** run a different route. use await to await the call */
  run: (...params: Parameters<typeof run>) => Promise<RouteResponse>
  /** let a different route handle this */
  goto: (...params: Parameters<typeof goto>) => void
} & (RouteRequestInGuild | RouteRequestInDM) & (RouteRequestFromCommand | RouteRequestFromButton | RouteRequestFromSelect)

export type AsyncInteractionHandler = (i: RouteRequest) => RouteResponse | Promise<RouteResponse> | void | Promise<void>

export type CordoRoute = {
  [CordoRoute]: CordoRoute
  handler: AsyncInteractionHandler
}

export function defineCordoRoute(route: RouteResponse | AsyncInteractionHandler) {
  return {
    [CordoRoute]: CordoRoute,
    handler: Array.isArray(route)
      ? () => route as RouteResponse
      : route as AsyncInteractionHandler
  }
}

export function assertCordoRequest<
  Location extends RouteRequest['location'],
  Source extends RouteRequest['source']
>(request: RouteRequest, assumptions: {
  location: Location
  source: Source
}): request is RouteRequest & (
  Location extends 'guild'
    ? RouteRequestInGuild
    : RouteRequestInDM
) & (
  Source extends 'command'
    ? RouteRequestFromCommand
    : Source extends 'button'
      ? RouteRequestFromButton
      : RouteRequestFromSelect
) {
  if (assumptions.location && request.location !== assumptions.location)
    throw new CordoErrorRouteAssumptionFailed(request, assumptions)
  if (assumptions.source && request.source !== assumptions.source)
    throw new CordoErrorRouteAssumptionFailed(request, assumptions)
  return true
}

export namespace RouteInternals {

  export type ParsedRoute = {
    name: string | null
    path: string
    realPath: string
    impl: CordoRoute
  }

  export async function readRoute(filePath: string): Promise<CordoRoute | null> {
    const content = await import(filePath)

    if (!content || !content.default)
      return null

    if (!content.default[CordoRoute])
      return null

    return content.default
  }

}
