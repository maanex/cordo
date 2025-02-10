import { Routes } from './routes'
import { ConfigInternals } from './files/config'
import { LockfileInternals } from './lockfile'

export { type CordoConfig, defineCordoConfig } from './files/config'

//

async function mountCordo() {
  const config = await ConfigInternals.readAndParseConfig()
  const lockfile = await LockfileInternals.readOrCreateLockfile(config.lockfile)
  await Routes.readFsTreeAndSyncLockfile(config.paths.pages, lockfile)
  LockfileInternals.writeLockfile(config.lockfile, lockfile)
}

//

export const Cordo = {
  mountCordo
}
Object.freeze(Cordo)
