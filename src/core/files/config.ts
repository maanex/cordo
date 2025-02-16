import { resolve } from 'node:path'
import defu from 'defu'
import type { PartialDeep } from 'type-fest'


const CordoConfigSymbol = Symbol('CordoConfigSymbol')

export type CordoConfig = {
  rootDir: string
  lockfile: string
  typeDest: string | null
  upstream: {
    baseUrl: string
  }
  client: {
    id: string
    publicKey: string
  }
  paths: {
    routes: string
  }
}

export function defineCordoConfig(conf: PartialDeep<CordoConfig> = {}): PartialDeep<CordoConfig> & { [CordoConfigSymbol]: typeof CordoConfigSymbol } {
  return {
    ...conf,
    [CordoConfigSymbol]: CordoConfigSymbol
  }
}

export namespace ConfigInternals {

  const defaultConfig: CordoConfig = {
    rootDir: '.',
    lockfile: './cordo.lock',
    typeDest: null,
    upstream: {
      baseUrl: 'https://discord.com/api/v10'
    },
    client: {
      id: '',
      publicKey: ''
    },
    paths: {
      routes: './routes'
    }
  }

  function locatePath() {
    if (process.env.CORDO_CONFIG_PATH)
      return String(process.env.CORDO_CONFIG_PATH)
    const searchRoot = process.cwd()
    return resolve(searchRoot, 'cordo.config.ts')
  }

  async function readConfig(): Promise<CordoConfig> {
    try {
      const filePath = locatePath()
      const content = await import(filePath)

      if (!content || !content.default)
        return defaultConfig

      if (!content.default[CordoConfigSymbol])
        return defaultConfig

      return defu(content.default, defaultConfig)
    } catch (ex) {
      return defaultConfig
    }
  }

  function resolveRelativePath(path: string, basePath = process.cwd()) {
    return resolve(basePath, path)
  }

  export async function readAndParseConfig(): Promise<CordoConfig> {
    const config = await readConfig()


    config.rootDir = resolveRelativePath(config.rootDir)
    config.lockfile = resolveRelativePath(config.lockfile)
    config.typeDest = config.typeDest
      ? resolveRelativePath(config.typeDest)
      : null

    config.paths.routes = resolveRelativePath(config.paths.routes, config.rootDir)

    return config
  }

}
