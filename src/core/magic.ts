import { AsyncLocalStorage } from 'async_hooks'
import { LibIds } from '../lib/ids'
import type { CordoInteraction } from './interaction'
import type { LockfileInternals } from './files/lockfile'
import type { CordoConfig } from './files/config'


type Context = {
  cwd: string
  lockfile: LockfileInternals.ParsedLockfile
  config: CordoConfig
  invoker: CordoInteraction
  idCounter: number
}

export namespace CordoMagic {

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

  export function getLockfile() {
    return Internals.getCtx().lockfile
  }

  export function getConfig() {
    return Internals.getCtx().config
  }

  export function getInvoker() {
    return Internals.getCtx().invoker
  }

  export function getCwd() {
    return Internals.getCtx().cwd
  }

  export function setCwd(path: string) {
    Internals.getCtx().cwd = path
    return path
  }

  export function resetIdCounter() {
    return Internals.getCtx().idCounter = 0
  }

  export function requestNewId<T extends boolean>(asString: T): T extends true ? string : number {
    const id = ++Internals.getCtx().idCounter
    if (!asString) return id as any
    return LibIds.stringify(id, 1) as any
  }

}
