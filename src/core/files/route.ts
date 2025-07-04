import { type APIEntitlement, type APIInteractionGuildMember, type APIMessage, type APIPartialChannel, type APIPartialGuild, type APIUser } from "discord-api-types/v10"
import type { CordoInteraction } from "../interaction"
import { RouteAssumptionFailedError } from "../../errors"
import type { goto, run } from "../../functions"
import type { CordoComponent } from "../../components/component"
import type { CordoModifier } from "../../components/modifier"


const CordoRouteSymbol = Symbol.for('CordoRoute')

export type RouteResponse = Array<CordoComponent | CordoModifier>

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

type RouteRequestFromModal = {
  source: 'modal'
  command: null
  selected: Map<string, string>
}

export type RouteRequest = {
  params: Record<string, string>
  /** route path is the path to this route you are currently in */
  routePath: string
  /** current path is the path where the interaction is currently happening. this is usually the same as routePath but might be different when called using run() */
  currentPath: string
  rawInteraction: CordoInteraction

  locals: {
    get<T = any>(key: string): T | undefined
    set(key: string, value: any): void
    delete(key: string): void
    has(key: string): boolean
  }

  /** this has the prefix raw because a cleaner representation of this data is planned */
  rawEntitlements: APIEntitlement[]

  /** acknowledge the request but only provide a reply later */
  ack: () => void
  /** render the provided components */
  render: (...response: RouteResponse) => void
  /** open a modal with the provided components */
  prompt: (modal: CordoComponent<'Modal'>) => void
  /** run a different route. use await to await the call. Returns whether successful, null if not run */
  run: (...params: Parameters<typeof run>) => Promise<boolean | null>
  /** let a different route handle this. Returns whether successful, null if not run */
  goto: (...params: Parameters<typeof goto>) => Promise<boolean | null>
} & (RouteRequestInGuild | RouteRequestInDM) & (RouteRequestFromCommand | RouteRequestFromButton | RouteRequestFromSelect | RouteRequestFromModal)

export type AsyncInteractionHandler = (i: RouteRequest) => RouteResponse | Promise<RouteResponse> | void | Promise<void> | boolean | Promise<boolean>

export type CordoRoute = {
  [CordoRouteSymbol]: typeof CordoRouteSymbol
  handler: AsyncInteractionHandler
}

export function defineCordoRoute(route: RouteResponse | AsyncInteractionHandler): CordoRoute {
  return {
    [CordoRouteSymbol]: CordoRouteSymbol,
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
}): asserts request is RouteRequest & (
  Location extends 'guild'
    ? RouteRequestInGuild
    : RouteRequestInDM
) & (
  Source extends 'command'
    ? RouteRequestFromCommand
    : Source extends 'button'
      ? RouteRequestFromButton
      : Source extends 'select'
        ? RouteRequestFromSelect
        : RouteRequestFromModal
) {
  if (assumptions.location && request.location !== assumptions.location)
    throw new RouteAssumptionFailedError(request, assumptions)
  if (assumptions.source && request.source !== assumptions.source)
    throw new RouteAssumptionFailedError(request, assumptions)
}

export namespace RouteInternals {

  export type ParsedRoute = {
    name: string | null
    path: string
    filePath: string
    impl: CordoRoute
  }

  export async function readRoute(filePath: string): Promise<CordoRoute | null> {
    const content = await import(filePath)

    if (!content || !content.default)
      return null

    if (!content.default[CordoRouteSymbol])
      return null

    return content.default
  }

}
