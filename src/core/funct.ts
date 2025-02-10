import { inOrder } from "./in-order"

const FunctSymbol = Symbol('FunctSymbol')

export type CordoFunct = {
  [FunctSymbol]: typeof FunctSymbol
}

export namespace FunctInternals {

  export function isFunct(obj: any): obj is CordoFunct {
    return obj && obj[FunctSymbol] === FunctSymbol
  }

  export function createFunct(): CordoFunct {
    return {
      [FunctSymbol]: FunctSymbol
    }
  }

  export function compileFunctToCustomId(funct: CordoFunct | CordoFunct[]): string {
    if (Array.isArray(funct)) {
      if (funct.length === 0)
        return '!' + ~~(Math.random() * 1e9)

      if (funct.length === 1)
        funct = funct[0]
      else
        funct = inOrder(...funct)
    }

    return 
  }

}
