import type { APIInteraction } from "discord-api-types/v10"


const Internals = Symbol('Internals')

export type CordoInteraction = {
  [Internals]: {
    answered: boolean
    httpCallback: ((payload: any) => any) | null
  }
  locals: Record<string, any>
} & APIInteraction

export namespace InteractionInternals {

  export function isCordoInteraction(i: CordoInteraction | APIInteraction): i is CordoInteraction {
    return Internals in i
  }

  export function get(i: CordoInteraction) {
    return i[Internals]
  }

  export function upgrade(i: APIInteraction | CordoInteraction): CordoInteraction {
    if (isCordoInteraction(i)) return i
    return {
      ...i,
      locals: {},
      [Internals]: {
        answered: false,
        httpCallback: null
      }
    }
  }

}
