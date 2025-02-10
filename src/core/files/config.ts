import { join } from 'node:path'
import defu from 'defu'


const CordoConfig = Symbol('CordoConfig')

export type CordoConfig = {
  rootDir: string
  lockfile: string
  paths: {
    pages: string
  }
}

export function defineCordoConfig(conf: Partial<CordoConfig> = {}) {
  return { ...conf, [CordoConfig]: CordoConfig }
}

export namespace ConfigInternals {

  const defaultConfig: CordoConfig = {
    rootDir: process.cwd(),
    lockfile: join(process.cwd(), 'cordo.lock'),
    paths: {
      pages: 'pages'
    }
  }

  function locatePath() {
    if (process.env.CORDO_CONFIG_PATH)
      return String(process.env.CORDO_CONFIG_PATH)
    const searchRoot = process.cwd()
    return join(searchRoot, 'cordo.config.ts')
  }

  async function readConfig(): Promise<CordoConfig> {
    try {
      const filePath = locatePath()
      const content = await import(filePath)

      if (!content || !content.default)
        return defaultConfig

      if (!content.default[CordoConfig])
        return defaultConfig

      return defu(content.default, defaultConfig)
    } catch (ex) {
      return defaultConfig
    }
  }

  export async function readAndParseConfig(): Promise<CordoConfig> {
    const config = await readConfig()

    return {
      rootDir: config.rootDir,
      lockfile: config.lockfile,
      paths: {
        pages: join(config.rootDir, config.paths.pages)
      }
    }
  }

}
