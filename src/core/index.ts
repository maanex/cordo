import type { APIInteraction } from 'discord-api-types/v10'
import { Routes } from './routes'
import { ConfigInternals } from './files/config'
import { LockfileInternals } from './lockfile'
import { CordoGateway } from './gateway'

export { type DynamicTypes } from './dynamic-types'
export { type CordoConfig, defineCordoConfig } from './files/config'
export { type CordoRoute, defineCordoRoute } from './files/route'

//

let lockfile: LockfileInternals.ParsedLockfile | null = null

async function mountCordo() {
  const config = await ConfigInternals.readAndParseConfig()
  lockfile = await LockfileInternals.readOrCreateLockfile(config.lockfile)
  await Routes.readFsTreeAndSyncLockfile(config.paths.routes, lockfile)
  
  LockfileInternals.writeLockfile(config.lockfile, lockfile, config.typeDest)
}

function triggerInteraction(interaction: APIInteraction, opts: {
  httpCallback?: (payload: any) => any
} = {}) {
  if (!lockfile) throw new Error('Cordo is not mounted')

  CordoGateway.triggerInteraction({
    interaction,
    httpCallback: opts.httpCallback,
    lockfile
  })
}

//

export const Cordo = {
  mountCordo,
  triggerInteraction
}
Object.freeze(Cordo)
