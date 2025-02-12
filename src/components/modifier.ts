import type { CordoComponentPayload, renderComponentList, StringComponentType } from "./component"


const CordoModifier = Symbol('CordoModifier')

export type CordoModifier = {
  [CordoModifier]: {
    name: string
    hooks?: {
      onRender?: (c: CordoComponentPayload<StringComponentType>) => CordoComponentPayload<StringComponentType>
      preRender?: (c: Array<CordoComponentPayload<StringComponentType>>) => Array<CordoComponentPayload<StringComponentType>>
      postRender?: (c: ReturnType<typeof renderComponentList>) => ReturnType<typeof renderComponentList>
    }
  }
}

export function createModifier(value: CordoModifier[typeof CordoModifier]): CordoModifier {
  return { [CordoModifier]: value }
}

export function readModifier(mod: CordoModifier): CordoModifier[typeof CordoModifier] {
  return mod[CordoModifier]!
}
