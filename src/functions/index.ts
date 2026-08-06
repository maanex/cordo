import { FunctCompiler } from './compiler'

export { goto } from './impl/goto'
export { run } from './impl/run'
export { value } from './impl/value'

export type { CordoFunct, CordoFunctRun } from './funct'


export namespace Extend {
  export const toCustomId: typeof FunctCompiler.toCustomId = (...args) => FunctCompiler.toCustomId(...args)
  export const parseCustomId: typeof FunctCompiler.parseCustomId = (...args) => FunctCompiler.parseCustomId(...args)
}
