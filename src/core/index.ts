import type { APIInteraction } from 'discord-api-types/v10'
import defu from 'defu'
import type { PartialDeep } from 'type-fest'
import { ConfigInternals, type CordoConfig, type ParsedCordoConfig } from './files/config'
import { LockfileInternals } from './files/lockfile'
import { CordoGateway } from './gateway'
import { RoutingFilesystem } from './routing/filesystem'

export { type DynamicTypes } from './dynamic-types'
export { type CordoConfig, defineCordoConfig } from './files/config'
export { type CordoRoute, type RouteRequest, defineCordoRoute, assertCordoRequest } from './files/route'
export { type CordoErrorBoundary, defineCordoErrorBoundary } from './files/error-boundary'
export { type CordoInteraction } from './interaction'

//

let lockfile: LockfileInternals.ParsedLockfile | null = null
let config: ParsedCordoConfig | null = null

async function mountCordo(configOverrides?: PartialDeep<CordoConfig>) {
  const fileConfig = await ConfigInternals.readAndParseConfig()
  config = configOverrides ? defu(configOverrides, fileConfig) as ParsedCordoConfig : fileConfig

  lockfile = await LockfileInternals.readOrCreateLockfile(config.lockfile)
  await RoutingFilesystem.readFsTreeAndSyncLockfile(config.paths.routes, lockfile)

  LockfileInternals.writeLockfile(config.lockfile, lockfile, config.typeDest)
}

function triggerInteraction(interaction: APIInteraction, opts: {
  httpCallback?: (payload: any) => any
} = {}) {
  if (!lockfile || !config)
    throw new Error('Cordo is not mounted')

  CordoGateway.triggerInteraction({
    interaction,
    httpCallback: opts.httpCallback,
    lockfile,
    config
  })
}

/**
 * you can provide constants you will commonly use in your routes to cordo
 * cordo will then create a lookup table to more efficiently access these constants in internal routing
 * you should not notice any difference but it will allow you to store more data on click or submit functions
 */
function registerConstants(constants: readonly string[]) {
  if (!lockfile || !config)
    throw new Error('Cordo is not mounted')

  let changesMade = false
  for (const entry of constants) {
    if (entry.length <= LockfileInternals.Const.idLength) // too short to save any space
      continue
    if (lockfile!.lut.includes(entry))
      continue

    lockfile.lut[lockfile.reg.lutCounter++] = entry
    changesMade = true
  }

  if (changesMade)
    return LockfileInternals.writeLockfile(config!.lockfile, lockfile!, config!.typeDest)
  else
    return Promise.resolve()
}

//

export const Cordo = {
  mountCordo,
  registerConstants,
  triggerInteraction,
  respondToRawInteraction: CordoGateway.respondTo,
}
Object.freeze(Cordo)
