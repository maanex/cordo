import { Routes } from './routes'
import { ConfigInternals } from './files/config'
import { LockfileInternals } from './lockfile'

export { type DynamicTypes } from './dynamic-types'
export { type CordoConfig, defineCordoConfig } from './files/config'
export { type CordoRoute, defineCordoRoute } from './files/route'

//

async function mountCordo() {
  const config = await ConfigInternals.readAndParseConfig()
  const lockfile = await LockfileInternals.readOrCreateLockfile(config.lockfile)
  await Routes.readFsTreeAndSyncLockfile(config.paths.routes, lockfile)
  LockfileInternals.writeLockfile(config.lockfile, lockfile, config.typeDest)
}

//

export const Cordo = {
  mountCordo
}
Object.freeze(Cordo)
