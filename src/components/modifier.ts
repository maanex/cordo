

const CordoModifier = Symbol('CordoModifier')

export type CordoModifier = {
  [CordoModifier]: typeof CordoModifier
}

export function createModifier(): CordoModifier {
  return {
    [CordoModifier]: CordoModifier,
  }
}
