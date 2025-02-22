import { LockfileInternals } from "../core/files/lockfile"
import { CordoMagic } from "../core/magic"
import { RoutingResolve } from "../core/routing/resolve"
import { LibIds } from "../lib/ids"
import { LibUtils } from "../lib/utils"
import { FunctInternals, type CordoFunct } from "./funct"


export namespace FunctCompiler {

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

  //

  export function toCustomId(funct: CordoFunct | Array<CordoFunct | null>): string {
    const list = (Array.isArray(funct) ? funct : [ funct ]).filter(Boolean) as CordoFunct[]

    const idc = CordoMagic.requestNewId(true)
    if (list.length === 0)
      return NoopIndicator + idc

    const argus: string[] = []
    const command: string[] = []
    const flags: number[] = []
    const extraValues: string[] = []

    for (const fun of list) {
      const arg = FunctInternals.readFunct(fun)
      const typeId = FunctInternals.Types.indexOf(arg.type)

      if (arg.type === 'goto' || arg.type === 'run') {
        const { routeId, args } = RoutingResolve.getRouteFromPath(arg.path, false)
        command.push(routeId)
        argus.push(...args)
        flags.push(arg.flags << 2 | typeId)
      } else if (arg.type === 'value') {
        extraValues.push(arg.path)
      }
    }

    const lut = CordoMagic.getLockfile().lut
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
      return CordoMagic.getLockfile().lut[LibIds.parse(arg.slice(1))] ?? ''

    if (arg[0] === ReferenceArgumentIndicator) 
      return parsedArguments[LibIds.parseSingle(arg[1])] ?? ''

    return ''
  }

  export function parseCustomId(id: string): CordoFunct[] {
    if (id.startsWith(NoopIndicator)) return []
    if (!id.includes(FunctVersion)) return []

    const headerBoundary = id.indexOf(FunctVersion)
    const header: Array<{ flags: number, type: FunctInternals.Types }> = []
    const routesRaw: string[] = []
    const argsRaw: string[] = []

    for (let i = 0; i < id.length - 1; i++) {
      if (i === headerBoundary)
        continue

      if (i < headerBoundary) {
        const flags = LibIds.parseSingle(id[i]) >> 2
        const type = FunctInternals.Types[LibIds.parseSingle(id[i]) & 0b11]
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
      const route = RoutingResolve.getRouteFromId(routeId)!
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

      out.push(FunctInternals.createFunct({
        flags: fun.flags,
        type: fun.type,
        path: path.join('/')
      }))
    }

    for (const remainingArg of argsRaw) {
      const parsed = parseArg(remainingArg, parsedArguments)
      parsedArguments.push(parsed)
      out.push(FunctInternals.createFunct({
        type: 'value',
        path: parsed,
        flags: 0
      }))
    }

    return out
  }

  export function getValues(functs: CordoFunct[]): string[] {
    return functs.map(f => FunctInternals.readFunct(f))
      .filter(f => f.type === 'value')
      .map(f => f.path)
  }

}
