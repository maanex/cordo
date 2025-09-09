import type { CordoConfig } from "./files/config"
import { CordoMagic } from "./magic"


export namespace Hooks {

  export function callHook<
    Name extends keyof CordoConfig['hooks'],
    Value = Parameters<NonNullable<CordoConfig['hooks'][Name]>>[0],
    Context = Parameters<NonNullable<CordoConfig['hooks'][Name]>>[1]
  >(
    hookName: Name,
    value: Value,
    context?: Context,
    config?: NonNullable<CordoConfig>
  ): ReturnType<NonNullable<CordoConfig['hooks'][Name]>> {
    if (!config) {
      const contextConfig = CordoMagic.getConfig()
      if (!contextConfig) {
        console.warn(`Calling hook '${hookName}' failed, no config provided and no config found in context.`)
        return value as any
      }

      config = contextConfig
    }

    const hook = config.hooks[hookName]
    if (!hook)
      // @ts-expect-error
      return value

    if (hookName === 'transformUserFacingText') {
      // @ts-expect-error
      context = {
        ...(context || {}),
        interaction: CordoMagic.getInvoker()
      }
    }

    // @ts-expect-error
    return hook(value, context)
  }

  export function isDefined(name: keyof CordoConfig['hooks']) {
    return !!CordoMagic.getConfig()?.hooks[name]
  }

}
