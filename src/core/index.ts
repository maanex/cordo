import type { APIInteraction } from 'discord-api-types/v10'
import defu from 'defu'
import type { PartialDeep } from 'type-fest'
import { Routes } from './routes'
import { ConfigInternals, type CordoConfig } from './files/config'
import { LockfileInternals } from './lockfile'
import { CordoGateway } from './gateway'

export { type DynamicTypes } from './dynamic-types'
export { type CordoConfig, defineCordoConfig } from './files/config'
export { type CordoRoute, defineCordoRoute, assertCordoRequest } from './files/route'
export { type CordoInteraction } from './interaction'

//

let lockfile: LockfileInternals.ParsedLockfile | null = null
let config: CordoConfig | null = null

async function mountCordo(configOverrides?: PartialDeep<CordoConfig>) {
  const fileConfig = await ConfigInternals.readAndParseConfig()
  config = configOverrides ? defu(configOverrides, fileConfig) as CordoConfig : fileConfig

  lockfile = await LockfileInternals.readOrCreateLockfile(config.lockfile)
  await Routes.readFsTreeAndSyncLockfile(config.paths.routes, lockfile)

  LockfileInternals.writeLockfile(config.lockfile, lockfile, config.typeDest)
}

function triggerInteraction(interaction: APIInteraction, opts: {
  httpCallback?: (payload: any) => any
} = {}) {
  if (!lockfile || !config) throw new Error('Cordo is not mounted')

  CordoGateway.triggerInteraction({
    interaction,
    httpCallback: opts.httpCallback,
    lockfile,
    config
  })
}

//

export const Cordo = {
  mountCordo,
  triggerInteraction
}
Object.freeze(Cordo)
