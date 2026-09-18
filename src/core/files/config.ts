import { resolve } from 'node:path'
import defu from 'defu'
import type { PartialDeep, Promisable } from 'type-fest'
import type { APIInteraction } from 'discord-api-types/v10'
import type { AxiosResponse } from 'axios'
import type { CordoInteraction } from '../interaction'
import type { StringComponentType } from '../../components/component'
import { parseFlags as runParseFlags, type FlagOpts as RunFlagOpts } from '../../functions/impl/run'
import { parseFlags as gotoParseFlags, type FlagOpts as GotoFlagOpts } from '../../functions/impl/goto'
import type { RouteRequest } from './route'


const CordoConfigSymbol = Symbol.for('CordoConfig')

type HookFor<T, Context = never> = null | ((value: T, context: Context) => Promisable<T | null>)
type TransformHookFor<T, Context = never> = null | ((value: T, context: Context) => T)

export type CordoConfig = {
  /**
   * Mounting cordo in headless mode will have the following effects:
   * - Cordo will not read the filesystem for config, lockfile, or routes.
   * - Cordo will not write to the lockfile or generate types.
   * - Cordo will not generate custom_ids for components.
   * - Cordo will not be able to route.
   * 
   * Use headless mode if you want to use cordo exclusively to render components without using cordo as your framework.
   */
  headless: boolean

  paths: {
    root: string
    routes: string
    lockfile: string
    types: string | null
  }
  defaults: {
    commandRoutePrefix?: string
  }
  /** The Discord client you are operating as */
  client: {
    id: string
    publicKey: string
  }
  /** Upstream describes the Discord API */
  upstream: {
    /** The Discord API base URL, e.g. https://discord.com/api/v10 */
    baseUrl: string
    /** If an interaction was not replied to within X millis, cordo will send the appropriate defer/ack response. Set to 0 to disable. */
    autoDeferMs: number
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

    /** capture errors that were produced while calling a funct yet could not be assigned a route and thus not be captured by a route error boundary */
    captureUnroutableErrors: HookFor<Error, { invoker: { funct: 'goto' | 'run', path: string, flags: number, interaction: CordoInteraction } }>
    /** capture errors that were not caught by any other error boundary */
    captureUnhandledErrors: HookFor<Error, { request: RouteRequest | undefined }>
  }
  functDefaultFlags: {
    run: Required<RunFlagOpts>
    goto: Required<GotoFlagOpts>
  }

  /** Cordo prints warnings for certain issues. You can omit specific warnings by adding them to this array. It is **not** recommended to blindly add warnings here without fully being aware what you are doing. */
  omitWarnings: Array<
    /** A component was assigned functs while also having a custom id override. This means the functs won't trigger */
    'customIdOverride' |
    /** A custom id had to be generated in headless mode. This means you rendered a component with functs assigned while in headless mode, resulting in the functs to not trigger. */
    'headlessCustomIdGeneration' |
    /** A an component attribute required by discord was not provided. Cordo filled in a default text for it to not break the component. */
    'placeholderTextAppearance'
  >
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
    headless: false,
    paths: {
      root: '.',
      routes: './routes',
      lockfile: './cordo.lock',
      types: null,
    },
    defaults: {
      commandRoutePrefix: 'command'
    },
    upstream: {
      baseUrl: 'https://discord.com/api/v10',
      autoDeferMs: 50
    },
    client: {
      id: '',
      publicKey: ''
    },
    hooks: {
      onRawInteraction: null,
      onBeforeHandle: null,
      onBeforeRespond: null,
      onAfterRespond: null,
      onNetworkError: null,
      transformCommandName: null,
      transformUserFacingText: null,
      captureUnroutableErrors: null,
      captureUnhandledErrors: null
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
    },
    omitWarnings: []
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

    if (!config.headless) {
      config.paths.root = resolveRelativePath(config.paths.root)
  
      config.paths.lockfile = resolveRelativePath(config.paths.lockfile, config.paths.root)
      config.paths.types = config.paths.types
        ? resolveRelativePath(config.paths.types, config.paths.root)
        : null
  
      config.paths.routes = resolveRelativePath(config.paths.routes, config.paths.root)
    }

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
