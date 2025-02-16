import { type APISelectMenuOption } from "discord-api-types/v10"
import { ComponentType, createComponent } from "../component"
import { FunctInternals, type CordoFunct, type CordoFunctRun } from "../../core/funct"
import { Hooks } from "../../core/hooks"


export function selectString() {
  let placeholderVal: string | undefined = undefined
  let minValues: number | undefined = undefined
  let maxValues: number | undefined = undefined
  let optionsVal: APISelectMenuOption[] = []
  let disabledVal: boolean | undefined = undefined
  const functVal: CordoFunct[] = []

  function getPlaceholder() {
    if (!placeholderVal)
      return undefined
    return Hooks.callHook(
      'transformUserFacingText',
      placeholderVal,
      { component: 'StringSelect', position: 'placeholder' }
    )
  }

  function getOptions(): APISelectMenuOption[] {
    return optionsVal.slice(0, 25).map(o => ({
      ...o,
      label: Hooks.callHook('transformUserFacingText', o.label, { component: 'StringSelect', position: 'option.label' }),
      description: Hooks.callHook('transformUserFacingText', o.description, { component: 'StringSelect', position: 'option.description' })
    }))
  }

  const out = {
    ...createComponent('StringSelect', () => ({
      type: ComponentType.StringSelect,
      placeholder: getPlaceholder(),
      min_values: minValues,
      max_values: maxValues,
      disabled: disabledVal,
      options: getOptions(),
      custom_id: FunctInternals.compileFunctToCustomId(disabledVal ? [] : functVal)
    })),

    placeholder: (text: string) => {
      placeholderVal = text
      return out
    },
    min: (num: number) => {
      minValues = num
      return out
    },
    max: (num: number) => {
      maxValues = num
      return out
    },
    disabled(disabled = true) {
      disabledVal = disabled
      return out
    },
    onClick: (...funct: CordoFunctRun) => {
      functVal.push(...funct)
      return out
    },
    setOptions(options: APISelectMenuOption[]) {
      optionsVal = options
      return out
    },
    addOption(o: APISelectMenuOption) {
      optionsVal.push(o)
      return out
    }
  }

  return out
}
