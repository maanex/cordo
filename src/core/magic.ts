import { AsyncLocalStorage } from 'async_hooks'
import { MissingContextError } from "../errors"
import { LibIds } from '../lib/ids'
import type { CordoInteraction } from './interaction'
import type { LockfileInternals } from './files/lockfile'
import type { ParsedCordoConfig } from './files/config'


type Context = {
  cwd: string
  lockfile: LockfileInternals.ParsedLockfile | null
  config: ParsedCordoConfig | null
  invoker: CordoInteraction | null
  idCounter: number
}

export namespace CordoMagic {

  // eslint-disable-next-line import/no-mutable-exports, prefer-const
  export let globalLockfile: LockfileInternals.ParsedLockfile | null = null
  // eslint-disable-next-line import/no-mutable-exports, prefer-const
  export let globalConfig: ParsedCordoConfig | null = null

  const als = new AsyncLocalStorage<Context>()

  export namespace Internals {

    export function runWithCtx(fn: () => any, ctx: Context) {
      als.run(ctx, fn)
    }

    export function getCtx() {
      return als.getStore()!
    }

  }

  //

  /** check if the current code is running in a cordo context */
  export function inContext() {
    return !!als.getStore()
  }

  /** get the current lockfile, if any */
  export function getLockfile() {
    return Internals.getCtx()?.lockfile ?? globalLockfile
  }

  /** get the current config, if any */
  export function getConfig() {
    return Internals.getCtx()?.config ?? globalConfig
  }

  /** get the current evoker, if in a context */
  export function getInvoker() {
    return Internals.getCtx()?.invoker ?? null
  }

  /** get the current working directory, if in a context */
  export function getCwd() {
    return Internals.getCtx()?.cwd ?? ''
  }

  /** set the current working directory, if in a context */
  export function setCwd(path: string) {
    if (Internals.getCtx())
      Internals.getCtx().cwd = path
    return path
  }

  /** reset the id counter, if in a context */
  export function resetIdCounter() {
    if (Internals.getCtx())
      Internals.getCtx().idCounter = 0
  }

  /** request a new id, if in a context */
  export function requestNewId<T extends boolean>(asString: T): T extends true ? string : number {
    if (!Internals.getCtx())
      throw new MissingContextError('Not in a Cordo context')

    const id = ++Internals.getCtx().idCounter
    if (!asString)
      return id as any
    return LibIds.stringify(id, 1) as any
  }

}
