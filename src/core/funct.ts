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


export function goto(path: DynamicTypes['Route'] | `./${string}` | '..' | `../${string}`, opts?: { asReply?: boolean, private?: boolean }): TypedCordoFunct<'goto'> {
  return FunctInternals.createFunct({
    type: 'goto',
    path,
    flags: (opts?.asReply ? (1 << 0) : 0) | (opts?.private ? (1 << 1) : 0)
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

  /** the current version of custom ids. pick another non base64 character if you make breaking changes */
  const FunctVersion = '$'
  /** customids starting with this will be ignored silently */
  const NoopIndicator = '!'

  export const Types = [
    'goto',
    'run'
  ] as const
  export type Types = typeof Types[number]

  export function isFunct(obj: any): obj is CordoFunct {
    return obj && obj[FunctSymbol] === FunctSymbol
  }

  export function createFunct<Type extends Types>(arg: TypedCordoFunct<Type>[typeof FunctSymbol]): TypedCordoFunct<Type> {
    return { [FunctSymbol]: arg }
  }

  export function compileFunctToCustomId(funct: CordoFunct | CordoFunct[]): string {
    const idc = InteractionEnvironment.Utils.requestNewId(true)
    if (Array.isArray(funct) && funct.length === 0)
      return NoopIndicator + idc

    const list = Array.isArray(funct) ? funct : [ funct ]
    const argus: string[] = []
    const command: string[] = []
    const flags: number[] = []

    for (const fun of list) {
      const arg = fun[FunctSymbol]
      const typeId = Types.indexOf(arg.type)

      if (arg.type === 'goto' || arg.type === 'run') {
        const { routeId, args } = InteractionEnvironment.Utils.getRouteFromPath(arg.path)
        command.push(routeId)
        argus.push(...args)
        flags.push(arg.flags << 2 | typeId)
      }
    }

    const flagsStr = flags.map(f => LibIds.stringify(f, 1)).join('')
    return `${flagsStr}${FunctVersion}${command.join('')}/${argus.join('/')}${idc}`
  }

  export function parseCustomId(id: string): CordoFunct[] {
    if (id.startsWith(NoopIndicator)) return []

    return []
  }

}
