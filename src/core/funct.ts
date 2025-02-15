import type { DynamicTypes } from "cordo"
import { LibIds } from "../lib/ids"
import { InteractionEnvironment } from "./interaction-environment"
import { LockfileInternals } from "./lockfile"
import { Routes } from "./routes"
import type { CordoInteraction } from "./interaction"
import type { RouteResponse } from "./files/route"


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


export const Flags = {
  Goto: {
    AsReply: 1 << 0,
    Private: 1 << 1,
    DisableComponents: 1 << 2,
  },
  Run: {
    Wait: 1 << 0
  }
}

/** goto will open the route provided */
export function goto(
  path: DynamicTypes['Route'] | `./${string}` | '.' | '..' | `../${string}`,
  opts?: {
    asReply?: boolean,
    private?: boolean,
    disableComponents?: boolean
  }
): TypedCordoFunct<'goto'> {
  return FunctInternals.createFunct({
    type: 'goto',
    path,
    flags: (opts?.asReply ? Flags.Goto.AsReply : 0) | (opts?.private ? Flags.Goto.Private : 0) | (opts?.disableComponents ? Flags.Goto.DisableComponents : 0)
  })
}

/** run will execute code on the route provided.
 * if wait is false, the code will be executed in the background and the next action is taken or the interaction is ack'd
 * if wait is true, the next action will wait for this route to finish running. if this route throws an error the error will be shown and the next action will not be taken
 * //TODO maybe we want to add an option to ignore errors or one to make errors show up in a reply
 */
export function run(
  path: DynamicTypes['Route'] | `./${string}` | '.' | '..' | `../${string}`,
  opts?: { wait?: boolean }
): TypedCordoFunct<'run'> {
  return FunctInternals.createFunct({
    type: 'run',
    path,
    flags: (opts?.wait ? Flags.Run.Wait : 0)
  })
}

export namespace FunctInternals {

  /** the current version of custom ids. pick another non base64 character if you make breaking changes */
  const FunctVersion = '$'
  /** customids starting with this will be ignored silently */
  const NoopIndicator = '!'
  /** the following argument should be treated as is */
  const PlainArgumentIndicator = '/'
  /** the following argument should be infered from the lookup table */
  const LutArgumentIndicator = '\\'

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

  export function readFunct(funct: CordoFunct): CordoFunct[typeof FunctSymbol] {
    return funct[FunctSymbol]
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
    if (!id.includes(FunctVersion)) return []

    const headerBoundary = id.indexOf(FunctVersion)
    const header: Array<{ flags: number, type: Types }> = []
    const routesRaw: string[] = []
    const argsRaw: string[] = []

    for (let i = 0; i < id.length - 1; i++) {
      if (i === headerBoundary)
        continue

      if (i < headerBoundary) {
        const flags = LibIds.parseSingle(id[i]) >> 2
        const type = Types[LibIds.parseSingle(id[i]) & 0b11]
        header.push({ flags, type })
      } else if (i < headerBoundary + 1 + header.length * LockfileInternals.Const.idLength) {
        routesRaw.push(id.slice(i, i + LockfileInternals.Const.idLength))
        i += LockfileInternals.Const.idLength - 1
      } else if (id[i] === PlainArgumentIndicator) {
        argsRaw.push(PlainArgumentIndicator)
      } else if (id[i] === LutArgumentIndicator) {
        argsRaw.push(LutArgumentIndicator)
      } else {
        argsRaw[argsRaw.length-1] = argsRaw.at(-1) + id[i]
      }
    }

    const out: CordoFunct[] = []
    for (const fun of header) {
      const routeId = routesRaw.shift()!
      const route = InteractionEnvironment.Utils.getRouteFromId(routeId)!
      const path = []
      for (const part of route.path.split('/')) {
        if (part.startsWith('[') && part.endsWith(']')) {
          const argRaw = argsRaw.shift()!
          if (argRaw[0] === PlainArgumentIndicator)
            path.push(argRaw.slice(1))
          else if (argRaw[0] === LutArgumentIndicator)
            path.push('') // TODO: lookup
        } else {
          path.push(part)
        }
      }

      out.push(createFunct({
        flags: fun.flags,
        type: fun.type,
        path: path.join('/')
      }))
    }

    return out
  }

  //

  export function evalFunct(funct: CordoFunct, i: CordoInteraction) {
    const { type, path, flags } = readFunct(funct)
    if (type === 'goto') {
      const route = InteractionEnvironment.Utils.getRouteFromPath(path)
      InteractionEnvironment.getCtx().currentRoute = path
      const asReply = (flags & Flags.Goto.AsReply) !== 0
      const isPrivate = (flags & Flags.Goto.Private) !== 0
      const disableComponents = (flags & Flags.Goto.DisableComponents) !== 0
      return Routes.callRoute(route.routeId, route.args, i, { asReply, isPrivate, disableComponents })
    } else if (type === 'run') {
      // TODO
      return Promise.resolve(null as unknown as RouteResponse)
    }
  }

}
