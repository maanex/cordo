import { InteractionEnvironment } from "../core/interaction-environment"
import type { LockfileInternals } from "../core/lockfile"
import type { CordoError } from "./cordo-error"


export namespace HandleErrors {

  function findNearestBoundary(startingPath: string, lockfile: LockfileInternals.ParsedLockfile) {
    // const options = lockfile.$runtime.errorBoundaries

    // const parts = startingPath.split('/')
    // for (let i = 0; i < parts.length; i++) {
    //   const part = parts[i]
    //   if (part.startsWith('[') && part.endsWith(']'))
    //     continue
    // }
  }

  export function thrownOnRoute(error: CordoError) {
    const { lockfile, currentRoute } = InteractionEnvironment.getCtx()

    console.error(`Error on route ${currentRoute}: ${error.message}`)
    console.error(error.stack)

    // const boundary = findNearestBoundary(filePath, lockfile)
    // console.log('handled by', boundary)
  }

}
