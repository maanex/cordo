import { resolve } from 'node:path'
import defu from 'defu'
import type { PartialDeep, Promisable } from 'type-fest'
import type { APIInteraction } from 'discord-api-types/v10'
import type { AxiosResponse } from 'axios'
import type { CordoInteraction } from '../interaction'
import type { StringComponentType } from '../../components/component'
import { parseFlags as runParseFlags, type FlagOpts as RunFlagOpts } from '../../functions/impl/run'
import { parseFlags as gotoParseFlags, type FlagOpts as GotoFlagOpts } from '../../functions/impl/goto'


const CordoConfigSymbol = Symbol.for('CordoConfig')

type HookFor<T, Context = never> = null | ((value: T, context: Context) => Promisable<T | null>)
type TransformHookFor<T, Context = never> = null | ((value: T, context: Context) => T)

export type CordoConfig = {
  rootDir: string
  lockfile: string
  typeDest: string | null
  upstream: {
    baseUrl: string
    /** if an interaction was not replied to within X millis, cordo will send the appropriate defer/ack response. Set to 0 to disable */
    autoDeferMs: number
  }
  client: {
    id: string
    publicKey: string
  }
  paths: {
    routes: string
  }
  /** hooks allow you to process certain data at certain points during cordo's internals. you can always return null to stop the flow of data at that point. */
  hooks: {
    /** gets called before cordo does anything with the interaction */
    onRawInteraction: HookFor<APIInteraction>,
    /** gets called after being read but before getting handled */
    onBeforeHandle: HookFor<CordoInteraction>,
    /** gets called before a response is returned or sent to discord */
    onBeforeRespond: HookFor<Record<string, any> | null, { interaction: CordoInteraction }>
    /** gets called with the response of outgoing api calls. DOES NOT get called on the first response as that's not an outgoing api call */
    onAfterRespond: HookFor<AxiosResponse>,
    /** gets called when outgoing api calls fail */
    onNetworkError: HookFor<any>,

    /** transforms the name of the invoked command to a file or route name */
    transformCommandName: TransformHookFor<string, { type: 'slash' | 'message' | 'user' }>,
    /** gets called by all cordo builtin components that render user facing text. e.g. buttons, text components, selects, etc */
    transformUserFacingText: TransformHookFor<string, { component: StringComponentType, position: null | string, interaction?: CordoInteraction }>,
  }
  functDefaultFlags: {
    run: Required<RunFlagOpts>
    goto: Required<GotoFlagOpts>
  }
}

export type ParsedCordoConfig = CordoConfig & {
  functDefaultFlags: {
    runBits: number
    gotoBits: number
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
      baseUrl: 'https://discord.com/api/v10',
      autoDeferMs: 50
    },
    client: {
      id: '',
      publicKey: ''
    },
    paths: {
      routes: './routes'
    },
    hooks: {
      onRawInteraction: null,
      onBeforeHandle: null,
      onBeforeRespond: null,
      onAfterRespond: null,
      onNetworkError: null,
      transformCommandName: null,
      transformUserFacingText: null
    },
    functDefaultFlags: {
      goto: {
        asReply: false,
        private: false,
        disableComponents: false
      },
      run: {
        wait: false,
        continueOnError: false,
        privateErrorMessage: false
      }
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

  export async function readAndParseConfig(): Promise<ParsedCordoConfig> {
    const config = await readConfig()

    config.rootDir = resolveRelativePath(config.rootDir)
    config.lockfile = resolveRelativePath(config.lockfile)
    config.typeDest = config.typeDest
      ? resolveRelativePath(config.typeDest)
      : null

    config.paths.routes = resolveRelativePath(config.paths.routes, config.rootDir)

    return {
      ...config,
      functDefaultFlags: {
        run: config.functDefaultFlags.run,
        runBits: runParseFlags(config.functDefaultFlags.run),
        goto: config.functDefaultFlags.goto,
        gotoBits: gotoParseFlags(config.functDefaultFlags.goto)
      }
    }
  }

}
