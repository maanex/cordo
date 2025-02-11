import type { DynamicTypes } from "cordo"
import { LibIds } from "../lib/ids"
import { InteractionEnvironment } from "./interaction-environment"


const FunctSymbol = Symbol('FunctSymbol')

export type CordoFunctRun
  = [ TypedCordoFunct<'goto' | 'run'> ]
  | [ TypedCordoFunct<'run'>, TypedCordoFunct<'goto'> ]
  | [ TypedCordoFunct<'run'>, TypedCordoFunct<'run'>, TypedCordoFunct<'goto'> ]
  | [ TypedCordoFunct<'run'>, TypedCordoFunct<'run'>, TypedCordoFunct<'run'>, TypedCordoFunct<'goto'> ]

export type TypedCordoFunct<Type extends FunctInternals.Types> = {
  [FunctSymbol]: {
    type: Type
    path: string
    flags: number
  }
}

export type CordoFunct = TypedCordoFunct<FunctInternals.Types>


export function goto(path: DynamicTypes['Route'] | `./${string}` | '..' | `../${string}`, opts?: { reply?: boolean, private?: boolean }): TypedCordoFunct<'goto'> {
  return FunctInternals.createFunct({
    type: 'goto',
    path,
    flags: (opts?.reply ? (1 << 0) : 0) | (opts?.private ? (1 << 1) : 0)
  })
}

export function run(path: DynamicTypes['Route'] | `./${string}` | '..' | `../${string}`, opts?: { wait?: boolean }): TypedCordoFunct<'run'> {
  return FunctInternals.createFunct({
    type: 'run',
    path,
    flags: (opts?.wait ? (1 << 0) : 0)
  })
}

export namespace FunctInternals {

  const FunctVersion = 1

  export type Types = 'goto' | 'run'

  export function isFunct(obj: any): obj is CordoFunct {
    return obj && obj[FunctSymbol] === FunctSymbol
  }

  export function createFunct<Type extends Types>(arg: TypedCordoFunct<Type>[typeof FunctSymbol]): TypedCordoFunct<Type> {
    return { [FunctSymbol]: arg }
  }

  export function compileFunctToCustomId(funct: CordoFunct | CordoFunct[]): string {
    if (Array.isArray(funct) && funct.length === 0)
      return '!' + ~~(Math.random() * 1e9)

    const list = Array.isArray(funct) ? funct : [ funct ]
    const argus: string[] = []
    const command: string[] = []
    const flags: number[] = []

    for (const fun of list) {
      const arg = fun[FunctSymbol]
      if (arg.type === 'goto' || arg.type === 'run') {
        const { routeId, args } = InteractionEnvironment.Utils.getRoute(arg.path)
        command.push(routeId)
        argus.push(...args)
        flags.push(arg.flags)
      }
    }

    const flagsStr = flags.some(f => f !== 0)
      ? `:${flags.map(f => LibIds.stringify(f, 1)).join('')}`
      : ''

    return `${FunctVersion}${command.join('')}${flagsStr}/${argus.join('/')}`
  }

}
