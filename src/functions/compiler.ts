import { LockfileInternals } from "../core/files/lockfile"
import { CordoMagic } from "../core/magic"
import { RoutingResolve } from "../core/routing/resolve"
import { MissingContextError } from "../errors/builtin/missing-context"
import { LibIds } from "../lib/ids"
import { LibUtils } from "../lib/utils"
import { FunctInternals, type CordoFunct } from "./funct"


export namespace FunctCompiler {

  /** the current version of custom ids. pick another non base64 character if you make breaking changes */
  const FunctVersion = '$'
  /** customids starting with this will be ignored silently */
  export const NoopIndicator = '!'
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

    /** arguments including argument type prefix */
    const argus: string[] = []
    /** commands, i.e. route ids */
    const command: string[] = []
    /** flags, i.e. encoded functs + funct flags */
    const flags: number[] = []
    /** arguments from value() functs, to be appended last */
    const extraValues: string[] = []

    // encode cwd
    const { routeId, args } = RoutingResolve.getRouteFromPath(CordoMagic.getCwd(), false)
    command.push(routeId)
    argus.push(...args)

    // encode functs
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

    // encode arguments
    const lut = CordoMagic.getLockfile()?.lut
    if (!lut)
      throw new MissingContextError('toCustomId failed, no lockfile found in context.')
    
    let argusStr = ''
    let counter = -1
    for (const arg of LibUtils.iterate(argus, extraValues)) {
      counter++

      // check if this argument has already been added so we can just refernce it
      const firstArrayPos = argus.indexOf(arg)
      if (firstArrayPos >= 0 && firstArrayPos < counter) {
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

    // build final id
    const flagsStr = flags.map(f => LibIds.stringify(f, 1)).join('')
    return `${flagsStr}${FunctVersion}${command.join('')}${argusStr}${idc}`
  }

  function parseArg(arg: string, parsedArguments: string[]) {
    if (arg[0] === PlainArgumentIndicator) 
      return arg.slice(1)

    if (arg[0] === LutArgumentIndicator) 
      return CordoMagic.getLockfile()?.lut[LibIds.parse(arg.slice(1))] ?? ''

    if (arg[0] === ReferenceArgumentIndicator) 
      return parsedArguments[LibIds.parseSingle(arg[1])] ?? ''

    return ''
  }

  type ParsedCustomId = {
    functs: CordoFunct[]
    values: string[]
    cwd: string | null
  }

  export function parseCustomId(id: string): ParsedCustomId {
    if (id.startsWith(NoopIndicator) || !id.includes(FunctVersion)) {
      return {
        functs: [],
        values: [],
        cwd: null
      }
    }

    const headerBoundary = id.indexOf(FunctVersion)
    const header: Array<{ flags: number, type: FunctInternals.Types }> = []
    const routesRaw: string[] = []
    const argsRaw: string[] = []

    for (let i = 0; i < id.length - 1; i++) {
      if (i === headerBoundary)
        continue

      if (i < headerBoundary) {
        // if i is smaller than the header boundary, we're still parsing the header
        const flags = LibIds.parseSingle(id[i]) >> 2
        const type = FunctInternals.Types[LibIds.parseSingle(id[i]) & 0b11]
        header.push({ flags, type })
      } else if (i < headerBoundary + 1 + (header.length + 1) * LockfileInternals.Const.idLength) {
        // if i is after header boundary but before the first argument, we're currently parsing the route ids
        routesRaw.push(id.slice(i, i + LockfileInternals.Const.idLength))
        i += LockfileInternals.Const.idLength - 1
      } else if (id[i] === PlainArgumentIndicator) {
        // we found a plain argument indicator, we'll start a new plain argument
        argsRaw.push(PlainArgumentIndicator)
      } else if (id[i] === LutArgumentIndicator) {
        // we found a lut argument indicator, we'll start a new lut argument
        argsRaw.push(LutArgumentIndicator)
      } else if (id[i] === ReferenceArgumentIndicator) {
        // we found a reference argument indicator, we'll start a new reference argument
        argsRaw.push(ReferenceArgumentIndicator)
      } else {
        // normal character in an argument, we'll add to the latest argument in the list
        argsRaw[argsRaw.length-1] = argsRaw[argsRaw.length-1] + id[i]
      }
    }

    const parsedArguments: string[] = []
    const readNextRoute = () => {
      const routeId = routesRaw.shift()!
      const route = RoutingResolve.getRouteFromId(routeId)!
      if (!route)
        return null

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

      return path.join('/')
    }

    const out: ParsedCustomId = {
      functs: [],
      values: [],
      cwd: null
    }

    const cwdRoute = readNextRoute()
    if (!cwdRoute)
      return out

    out.cwd = cwdRoute

    for (const fun of header) {
      const path = readNextRoute()
      if (!path)
        break

      out.functs.push(FunctInternals.createFunct({
        flags: fun.flags,
        type: fun.type,
        path
      }))
    }

    for (const remainingArg of argsRaw) {
      const parsed = parseArg(remainingArg, parsedArguments)
      parsedArguments.push(parsed)
      out.values.push(parsed)
    }

    return out
  }

}
