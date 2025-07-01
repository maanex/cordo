import type { CordoComponentPayload, renderComponentList, StringComponentType } from "./component"


const CordoModifierSymbol = Symbol.for('CordoModifier')

export type CordoModifier = {
  [CordoModifierSymbol]: {
    name: string
    hooks?: {
      onRender?: (c: CordoComponentPayload<StringComponentType>) => CordoComponentPayload<StringComponentType>
      preRender?: (c: Array<CordoComponentPayload<StringComponentType>>) => Array<CordoComponentPayload<StringComponentType>>
      postRender?: (c: ReturnType<typeof renderComponentList>) => ReturnType<typeof renderComponentList>
    }
  }
}

export function createModifier(value: CordoModifier[typeof CordoModifierSymbol]): CordoModifier {
  return { [CordoModifierSymbol]: value }
}

export function readModifier(mod: CordoModifier): CordoModifier[typeof CordoModifierSymbol] {
  return mod[CordoModifierSymbol]!
}
