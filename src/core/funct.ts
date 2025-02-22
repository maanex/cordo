import type { DynamicTypes } from "cordo"
import { LibIds } from "../lib/ids"
import { LibUtils } from "../lib/utils"
import { CordoError } from "../errors"
import { HandleErrors } from "../errors/handle"
import { InteractionEnvironment } from "./interaction-environment"
import { LockfileInternals } from "./lockfile"
import { Routes } from "./routes"
import type { CordoInteraction } from "./interaction"


const FunctSymbol = Symbol('FunctSymbol')

export type CordoFunctRun = CordoFunct[]
  // = [ CordoFunct<'goto' | 'run'> ]
  // | [ CordoFunct<'run'>, CordoFunct<'goto' | 'run'> ]
  // | [ CordoFunct<'run'>, CordoFunct<'run'>, CordoFunct<'goto' | 'run'> ]
  // | [ CordoFunct<'run'>, CordoFunct<'run'>, CordoFunct<'run'>, CordoFunct<'goto' | 'run'> ]

export type CordoFunct<Type extends FunctInternals.Types = FunctInternals.Types> = {
  [FunctSymbol]: {
    type: Type
    path: string
    flags: number
  }
}


export const Flags = {
  Goto: {
    AsReply: 1 << 0,
    Private: 1 << 1,
    DisableComponents: 1 << 2,
  },
  Run: {
    Wait: 1 << 0,
    ContinueOnError: 1 << 1
  }
}

/** goto will open the route provided */
export function goto(
  path: DynamicTypes['Route'] | `./${string}` | '.' | '..' | `../${string}` | CordoFunct<'goto'>,
  opts?: {
    asReply?: boolean,
    private?: boolean,
    disableComponents?: boolean
  }
): CordoFunct<'goto'> {
  const usePath = FunctInternals.isFunct(path)
    ? path[FunctSymbol].path
    : path

  let flags = FunctInternals.isFunct(path)
    ? path[FunctSymbol].flags
    : 0

  if (opts?.asReply !== undefined)
    flags = (flags & ~Flags.Goto.AsReply) | (opts.asReply ? Flags.Goto.AsReply : 0)
  if (opts?.asReply !== undefined)
    flags = (flags & ~Flags.Goto.AsReply) | (opts.asReply ? Flags.Goto.AsReply : 0)
  if (opts?.disableComponents !== undefined)
    flags = (flags & ~Flags.Goto.DisableComponents) | (opts.disableComponents ? Flags.Goto.DisableComponents : 0)

  return FunctInternals.createFunct({
    type: 'goto',
    path: usePath,
    flags
  })
}

/** run will execute code on the route provided.
 * if wait is false, the code will be executed in the background and the next action is taken or the interaction is ack'd
 * if wait is true, the next action will wait for this route to finish running. if this route throws an error the error will be shown and the next action will not be taken
 * 
 * continueOnError is only relevant when wait is set to true
 * if continueOnError is true, the next action will be taken even if the run route throws an error. the error will be presented in an emphemeral response
 * if continueOnError is false, following actions will not execute and the error is rendered over the current route
 */
export function run(
  path: DynamicTypes['Route'] | `./${string}` | '.' | '..' | `../${string}` | CordoFunct<'run'>,
  opts?: {
    wait?: boolean
    continueOnError?: boolean
  }
): CordoFunct<'run'> {
  const usePath = FunctInternals.isFunct(path)
    ? path[FunctSymbol].path
    : path

  let flags = FunctInternals.isFunct(path)
    ? path[FunctSymbol].flags
    : 0

  if (opts?.wait !== undefined)
    flags = (flags & ~Flags.Run.Wait) | (opts.wait ? Flags.Run.Wait : 0)
  if (opts?.continueOnError !== undefined)
    flags = (flags & ~Flags.Run.ContinueOnError) | (opts.continueOnError ? Flags.Run.ContinueOnError : 0)

  return FunctInternals.createFunct({
    type: 'run',
    path: usePath,
    flags
  })
}

/** value will do as you think and just encode a value
 * this is mostly used internally and you should not need to use this
 */
export function value(
  value: string,
): CordoFunct<'value'> {
  return FunctInternals.createFunct({
    type: 'value',
    path: value,
    flags: 0
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
  /** the following argument has the same value as an earlier argument */
  const ReferenceArgumentIndicator = '|'

  export const Types = [
    'goto',
    'run',
    'value' // value is a runtime only type, if you add something here move it in front so we don't lose the 0b10 id
  ] as const
  export type Types = typeof Types[number]

  export function isFunct(obj: any): obj is CordoFunct {
    return obj && obj[FunctSymbol]
  }

  export function createFunct<Type extends Types>(arg: CordoFunct<Type>[typeof FunctSymbol]): CordoFunct<Type> {
    return { [FunctSymbol]: arg }
  }

  export function readFunct(funct: CordoFunct): CordoFunct[typeof FunctSymbol] {
    return funct[FunctSymbol]
  }

  export function compileFunctToCustomId(funct: CordoFunct | Array<CordoFunct | null>): string {
    const list = (Array.isArray(funct) ? funct : [ funct ]).filter(Boolean) as CordoFunct[]

    const idc = InteractionEnvironment.Utils.requestNewId(true)
    if (list.length === 0)
      return NoopIndicator + idc

    const argus: string[] = []
    const command: string[] = []
    const flags: number[] = []
    const extraValues: string[] = []

    for (const fun of list) {
      const arg = fun[FunctSymbol]
      const typeId = Types.indexOf(arg.type)

      if (arg.type === 'goto' || arg.type === 'run') {
        const { routeId, args } = InteractionEnvironment.Utils.getRouteFromPath(arg.path, false)
        command.push(routeId)
        argus.push(...args)
        flags.push(arg.flags << 2 | typeId)
      } else if (arg.type === 'value') {
        extraValues.push(arg.path)
      }
    }

    const lut = InteractionEnvironment.getCtx().lockfile.lut
    let argusStr = ''
    let counter = -1
    for (const arg of LibUtils.iterate(argus, extraValues)) {
      counter++

      // check if this argument has already been added so we can just refernce it
      const firstArrayPos = argus.indexOf(arg)
      if (firstArrayPos > 0 && firstArrayPos < counter) {
        argusStr += ReferenceArgumentIndicator + LibIds.stringify(firstArrayPos, 1)
        continue
      }

      // check if this argument is part of the lut
      const lutIndex = lut.indexOf(arg)
      if (lutIndex >= 0) {
        argusStr += LutArgumentIndicator + LibIds.stringify(lutIndex, LockfileInternals.Const.idLength)
        continue
      }

      argusStr += PlainArgumentIndicator + arg
    }

    const flagsStr = flags.map(f => LibIds.stringify(f, 1)).join('')
    return `${flagsStr}${FunctVersion}${command.join('')}${argusStr}${idc}`
  }

  function parseArg(arg: string, parsedArguments: string[]) {
    if (arg[0] === PlainArgumentIndicator) 
      return arg.slice(1)

    if (arg[0] === LutArgumentIndicator) 
      return InteractionEnvironment.getCtx().lockfile.lut[LibIds.parse(arg.slice(1))] ?? ''

    if (arg[0] === ReferenceArgumentIndicator) 
      return parsedArguments[LibIds.parseSingle(arg[1])] ?? ''

    return ''
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
      } else if (id[i] === ReferenceArgumentIndicator) {
        argsRaw.push(ReferenceArgumentIndicator)
      } else {
        argsRaw[argsRaw.length-1] = argsRaw[argsRaw.length-1] + id[i]
      }
    }

    const out: CordoFunct[] = []
    const parsedArguments: string[] = []
    for (const fun of header) {
      const routeId = routesRaw.shift()!
      const route = InteractionEnvironment.Utils.getRouteFromId(routeId)!
      if (!route)
        return []

      const path = []
      for (const part of route.path.split('/')) {
        if (!part.startsWith('[') || !part.endsWith(']')) {
          path.push(part)
          continue
        }

        const argRaw = argsRaw.shift()!
        const parsed = parseArg(argRaw, parsedArguments)
        path.push(parsed)
        parsedArguments.push(parsed)
      }

      out.push(createFunct({
        flags: fun.flags,
        type: fun.type,
        path: path.join('/')
      }))
    }

    for (const remainingArg of argsRaw) {
      const parsed = parseArg(remainingArg, parsedArguments)
      parsedArguments.push(parsed)
      out.push(createFunct({
        type: 'value',
        path: parsed,
        flags: 0
      }))
    }

    return out
  }

  //

  /** returns whether to continue. False means abort execution of following functs */
  export async function evalFunct(funct: CordoFunct, i: CordoInteraction): Promise<boolean> {
    const { type, path, flags } = readFunct(funct)
    if (type === 'goto') {
      const route = InteractionEnvironment.Utils.getRouteFromPath(path, true)
      InteractionEnvironment.getCtx().currentRoute = path
      const asReply = (flags & Flags.Goto.AsReply) !== 0
      const isPrivate = (flags & Flags.Goto.Private) !== 0
      const disableComponents = (flags & Flags.Goto.DisableComponents) !== 0
      await Routes.callRoute(route.routeId, route.args, i, { asReply, isPrivate, disableComponents })
      return true
    } else if (type === 'run') {
      const route = InteractionEnvironment.Utils.getRouteFromPath(path, true)
      const doWait = (flags & Flags.Run.Wait) !== 0
      try {
        const routeResponse = Routes.callRoute(route.routeId, route.args, i, { disableRendering: true })
        if (doWait)
          await routeResponse
        return true
      } catch (e) {
        if (e instanceof CordoError) 
          HandleErrors.thrownOnRoute(e)
         else 
          console.error(e)
        
        return (flags & Flags.Run.ContinueOnError) !== 0
      }
    } else if (type === 'value') {
      return true
    }

    return true
  }

  export function getValues(functs: CordoFunct[]): string[] {
    return functs.map(f => readFunct(f))
      .filter(f => f.type === 'value')
      .map(f => f.path)
  }

}
