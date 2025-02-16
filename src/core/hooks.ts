import type { CordoConfig } from "./files/config"
import { InteractionEnvironment } from "./interaction-environment"


export namespace Hooks {

  export function callHook<
    Name extends keyof CordoConfig['hooks'],
    Value = Parameters<NonNullable<CordoConfig['hooks'][Name]>>[0],
    Context = Parameters<NonNullable<CordoConfig['hooks'][Name]>>[1]
  >(
    hookName: Name,
    value: Value,
    context?: Context,
    config?: CordoConfig
  ): ReturnType<NonNullable<CordoConfig['hooks'][Name]>> {
    if (!config) 
      config = InteractionEnvironment.getCtx().config

    const hook = config.hooks[hookName]
    if (!hook)
      // @ts-expect-error
      return value

    if (hookName === 'transformUserFacingText') {
      // @ts-expect-error
      context = {
        ...(context || {}),
        interaction: InteractionEnvironment.getCtx().invoker
      }
    }

    // @ts-expect-error
    return hook(value, context)
  }

  export function isDefined(name: keyof CordoConfig['hooks']) {
    return !!InteractionEnvironment.getCtx().config.hooks[name]
  }

}
