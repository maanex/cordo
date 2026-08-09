import type { APIInteraction } from "discord-api-types/v10"
import type { CordoCommand } from "./files/command"


const CordoInteractionSymbol = Symbol.for('CordoInteraction')

export type CordoInteraction = {
  [CordoInteractionSymbol]: {
    answered: boolean
    httpCallback: ((payload: any) => any) | null
    // will be set to the command linked to this interaction if it was triggered by a command, otherwise null
    commandEntrypoint: CordoCommand | null
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
        httpCallback: null,
        commandEntrypoint: null
      }
    }
  }

}
