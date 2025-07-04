import { Hooks } from "../../core/hooks"
import type { CordoFunct, CordoFunctRun } from "../../functions"
import { FunctCompiler } from "../../functions/compiler"
import { ComponentType, createComponent, renderComponentList, type CordoComponent } from "../component"
import type { CordoModifier } from "../modifier"


export type AllowedComponents = CordoComponent<'TextInput'> | CordoModifier
type AllowedComponentArray = Array<AllowedComponents | AllowedComponents[]>

export function modal(...components: AllowedComponentArray) {
  let titleVal: string | undefined = undefined
  const functVal: CordoFunct[] = []

  function getTitle() {
    if (!titleVal)
      return 'Modal'

    return Hooks.callHook(
      'transformUserFacingText',
      titleVal,
      { component: 'Modal', position: 'title' }
    )
  }

  const out = {
    ...createComponent('Modal', ({ hirarchy, attributes }) => ({
      type: ComponentType.Modal,
      components: renderComponentList(components.flat(), 'Modal', hirarchy, attributes),
      title: getTitle(),
      custom_id: FunctCompiler.toCustomId(functVal)
    })),

    title: (value: string) => {
      titleVal = value
      return out
    },
    onClick: (...funct: CordoFunctRun) => {
      functVal.push(...funct)
      return out
    },
    *[Symbol.iterator]() {
      for (const component of components) {
        if (Array.isArray(component))
          yield* component
        else
          yield component
      }
    }
  }

  return out
}
