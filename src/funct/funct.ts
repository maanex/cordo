import type { CordoInteraction } from "../core"
import { evalGoto } from "./impl/goto"
import { evalRun } from "./impl/run"


const CordoFunctSymbol = Symbol('CordoFunct')

export type CordoFunctRun = CordoFunct[]

export type CordoFunct<Type extends FunctInternals.Types = FunctInternals.Types> = {
  [CordoFunctSymbol]: {
    type: Type
    path: string
    flags: number
  }
}


export namespace FunctInternals {

  export const Types = [
    'goto',
    'run',
    'value' // value is a runtime only type, if you add something here move it in front so we don't lose the 0b10 id
  ] as const
  export type Types = typeof Types[number]

  //

  export function isFunct(obj: any): obj is CordoFunct {
    return obj && obj[CordoFunctSymbol]
  }

  export function createFunct<Type extends Types>(arg: CordoFunct<Type>[typeof CordoFunctSymbol]): CordoFunct<Type> {
    return { [CordoFunctSymbol]: arg }
  }

  export function readFunct(funct: CordoFunct): CordoFunct[typeof CordoFunctSymbol] {
    return funct[CordoFunctSymbol]
  }

  //

  /** returns whether to continue. False means abort execution of following functs */
  export function evalFunct(funct: CordoFunct, i: CordoInteraction): Promise<boolean> {
    const { type, path, flags } = readFunct(funct)

    if (type === 'goto') 
      return evalGoto(path, flags, i)
    else if (type === 'run') 
      return evalRun(path, flags, i)

    return Promise.resolve(true)
  }

}
