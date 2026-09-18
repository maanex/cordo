import type { APIInteraction } from 'discord-api-types/v10'
import defu from 'defu'
import type { PartialDeep } from 'type-fest'
import { HeadlessModeError, NotMountedError } from "../errors"
import { ConfigInternals, type CordoConfig, type ParsedCordoConfig } from './files/config'
import { LockfileInternals } from './files/lockfile'
import { CordoGateway } from './gateway'
import { RoutingFilesystem } from './routing/filesystem'
import { CordoMagic } from './magic'
import type { CordoInteraction } from './interaction'
import { CommandInternals } from './files/command'

export { type DynamicTypes } from './dynamic-types'
export { type CordoConfig, defineCordoConfig } from './files/config'
export { type CordoRoute, type RouteRequest, defineCordoRoute, assertCordoRequest } from './files/route'
export { type CordoCommand, defineCordoCommand } from './files/command'
export { type CordoErrorBoundary, defineCordoErrorBoundary } from './files/error-boundary'
export { type CordoInteraction } from './interaction'

//

async function mountCordo(configOverrides?: PartialDeep<CordoConfig>) {
  const fileConfig = await ConfigInternals.readAndParseConfig()
  CordoMagic.globalConfig = configOverrides
    ? defu(configOverrides, fileConfig) as ParsedCordoConfig
    : fileConfig

  if (!CordoMagic.globalConfig.headless) {
    CordoMagic.globalLockfile = await LockfileInternals.readOrCreateLockfile(CordoMagic.globalConfig!.paths.lockfile)
    await RoutingFilesystem.readFsTreeAndSyncLockfile(CordoMagic.globalConfig.paths.routes, CordoMagic.globalLockfile, CordoMagic.globalConfig)
  
    LockfileInternals.writeLockfile(CordoMagic.globalConfig.paths.lockfile, CordoMagic.globalLockfile, CordoMagic.globalConfig.paths.types)
  }
}

function triggerInteraction(interaction: APIInteraction, opts: {
  httpCallback?: (payload: any) => any
} = {}) {
  if (!CordoMagic.globalLockfile || !CordoMagic.globalConfig) {
    if (CordoMagic.globalConfig?.headless)
      throw new HeadlessModeError('[Cordo.triggerInteraction] Cordo is mounted in headless mode and cannot process interactions')
    else
      throw new NotMountedError('[Cordo.triggerInteraction] Cordo is not mounted')
  }

  CordoGateway.triggerInteraction({
    interaction,
    httpCallback: opts.httpCallback,
    lockfile: CordoMagic.globalLockfile,
    config: CordoMagic.globalConfig
  })
}

/**
 * you can provide constants you will commonly use in your routes to cordo
 * cordo will then create a lookup table to more efficiently access these constants in internal routing
 * you should not notice any difference but it will allow you to store more data on click or submit functions
 */
function registerConstants(constants: readonly string[]) {
  if (!CordoMagic.globalLockfile || !CordoMagic.globalConfig) {
    if (CordoMagic.globalConfig?.headless)
      throw new HeadlessModeError('[Cordo.registerConstants] Cordo is mounted in headless mode and cannot register constants')
    else
      throw new NotMountedError('[Cordo.registerConstants] Cordo is not mounted')
  }

  let changesMade = false
  for (const entry of constants) {
    if (entry.length <= LockfileInternals.Const.idLength) // too short to save any space
      continue
    if (CordoMagic.globalLockfile!.lut.includes(entry))
      continue

    CordoMagic.globalLockfile.lut[CordoMagic.globalLockfile.reg.lutCounter++] = entry
    changesMade = true
  }

  if (changesMade)
    return LockfileInternals.writeLockfile(CordoMagic.globalConfig!.paths.lockfile, CordoMagic.globalLockfile!, CordoMagic.globalConfig!.paths.types)
  else
    return Promise.resolve()
}

//

export const Cordo = {
  mountCordo,
  registerConstants,
  triggerInteraction,
  respondToRawInteraction: CordoGateway.respondTo,
  syncCommands: (opts?: { maxRetries?: number }) => CommandInternals.syncCommands(CordoMagic.globalLockfile?.$runtime?.registeredCommands, undefined, opts),
  getConfig: () => CordoMagic.globalConfig,
}
Object.freeze(Cordo)


export namespace Extend {

  export function runInCordoContext(
    fn: () => any,
    ctx?: {
      invoker?: CordoInteraction
      lockfile?: LockfileInternals.ParsedLockfile
      config?: ParsedCordoConfig
    }
  ) {
    CordoMagic.Internals.runWithCtx(fn, {
      invoker: ctx?.invoker ?? null,
      lockfile: ctx?.lockfile ?? null,
      config: ctx?.config ?? null,
      cwd: '',
      idCounter: 0
    })
  }

}
