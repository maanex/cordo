import type { LocalizedString } from "../../lib/localization"
import type { CordoInteraction } from "../interaction"


const CordoAutocompleteSymbol = Symbol.for('CordoAutocomplete')

type AutocompleteHandler<ReturnType extends string | number> = (
  value: ReturnType,
  i: CordoInteraction,
) => Array<{
  name: string | LocalizedString
  value: ReturnType
}>

export type CordoAutocomplete<ReturnType extends string | number> = {
  [CordoAutocompleteSymbol]: AutocompleteHandler<ReturnType>
}

export function defineCordoAutocomplete<ReturnType extends string | number>(handler: AutocompleteHandler<ReturnType>): CordoAutocomplete<ReturnType> {
  return {
    [CordoAutocompleteSymbol]: handler
  }
}

export namespace AutocompleteInternals {
  export function isAutocomplete(obj: any): obj is CordoAutocomplete<any> {
    return obj && typeof obj === 'object' && CordoAutocompleteSymbol in obj
  }
}
