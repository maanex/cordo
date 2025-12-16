import type { CordoInteraction } from "../core"
import type { RouteResponse } from "../core/files/route"
import type { RoutingRespond } from "../core/routing/respond"
import type { CordoComponentPayload, renderComponentList, StringComponentType } from "./component"


const CordoModifierSymbol = Symbol.for('CordoModifier')

export type CordoModifier = {
  [CordoModifierSymbol]: {
    name: string
    hooks?: {
      onRender?: (c: CordoComponentPayload<StringComponentType>) => CordoComponentPayload<StringComponentType>
      beforeRender?: (c: Array<CordoComponentPayload<StringComponentType>>) => Array<CordoComponentPayload<StringComponentType>>
      afterRender?: (c: ReturnType<typeof renderComponentList>) => ReturnType<typeof renderComponentList>
      beforeRouteResponse?: (response: RouteResponse, i: CordoInteraction, opts: RoutingRespond.RouteOpts) => void
    }
  }
}

export function createModifier(value: CordoModifier[typeof CordoModifierSymbol]): CordoModifier {
  return { [CordoModifierSymbol]: value }
}

export function isModifier(t: Record<string, any>): t is CordoModifier {
  return !!t && CordoModifierSymbol in t
}

export function readModifier(mod: CordoModifier): CordoModifier[typeof CordoModifierSymbol] {
  return mod[CordoModifierSymbol]!
}
