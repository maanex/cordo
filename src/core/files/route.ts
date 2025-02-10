import type { CordoComponent, StringComponentType } from "../../components/component"
import type { CordoInteraction } from "../interaction"
import type { CordoModifier } from "../../components/modifier"


const CordoRoute = Symbol('CordoRoute')

type RouteResponse = Array<CordoComponent<StringComponentType> | CordoModifier>
type AsyncInteractionHandler = (i: CordoInteraction) => RouteResponse | Promise<RouteResponse>

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
    impl: CordoRoute
  }

  export async function readRoute(filePath: string): Promise<CordoRoute | null> {
    const content = await import(filePath)

    if (!content || !content.default)
      return null

    if (!content.default[CordoRoute])
      return null

    return content
  }

}
