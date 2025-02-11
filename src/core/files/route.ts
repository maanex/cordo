import { type CordoComponent, type StringComponentType } from "../../components/component"
import type { CordoInteraction } from "../interaction"
import type { CordoModifier } from "../../components/modifier"


const CordoRoute = Symbol('CordoRoute')

export type RouteInput = {
  params: Record<string, string>
  rawInteraction: CordoInteraction
}

export type RouteResponse = Array<CordoComponent<StringComponentType> | CordoModifier>
export type AsyncInteractionHandler = (i: RouteInput) => RouteResponse | Promise<RouteResponse>

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

  export function buildRouteInput(route: ParsedRoute, args: string[], interaction: CordoInteraction) {
    const params = route.path
      .split('/')
      .filter(p => /^\[\w+\]$/.test(p))
      .map(p => p.slice(1, -1))
      .reduce((obj, name, idx) => ({ [name]: args[idx], ...obj }), {} as Record<string, string>)

    return {
      params,
      rawInteraction: interaction
    }
  }

}
