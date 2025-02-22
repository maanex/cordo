import type { APIInteraction } from "discord-api-types/v10"


const CordoInteractionSymbol = Symbol('CordoInteraction')

export type CordoInteraction = {
  [CordoInteractionSymbol]: {
    answered: boolean
    httpCallback: ((payload: any) => any) | null
  }
  locals: Record<string, any>
} & APIInteraction


export namespace InteractionInternals {

  export function isCordoInteraction(i: CordoInteraction | APIInteraction): i is CordoInteraction {
    return CordoInteractionSymbol in i
  }

  export function get(i: CordoInteraction) {
    return i[CordoInteractionSymbol]
  }

  export function upgrade(i: APIInteraction | CordoInteraction): CordoInteraction {
    if (isCordoInteraction(i)) return i
    return {
      ...i,
      locals: {},
      [CordoInteractionSymbol]: {
        answered: false,
        httpCallback: null
      }
    }
  }

}
