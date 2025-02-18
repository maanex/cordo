import { type APISelectMenuOption } from "discord-api-types/v10"
import { ComponentType, createComponent } from "../component"
import { FunctInternals, value, type CordoFunct, type CordoFunctRun } from "../../core/funct"
import { Hooks } from "../../core/hooks"


type SelectMenuOption<Value extends string = string> = Omit<APISelectMenuOption, 'value'> & ({
  value?: Value
  onClick?: CordoFunct | CordoFunctRun
})

export function selectString<Values extends string = string>() {
  let placeholderVal: string | undefined = undefined
  let minValues: number | undefined = undefined
  let maxValues: number | undefined = undefined
  let optionsVal: SelectMenuOption[] = []
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

  function getOptions(): SelectMenuOption[] {
    return optionsVal.slice(0, 25).map(o => ({
      ...o,
      label: Hooks.callHook('transformUserFacingText', o.label, { component: 'StringSelect', position: 'option.label' }),
      description: o.description
        ? Hooks.callHook('transformUserFacingText', o.description, { component: 'StringSelect', position: 'option.description' })
        : undefined,
      value: FunctInternals.compileFunctToCustomId([
        ...(o.onClick
          ? Array.isArray(o.onClick)
            ? o.onClick
            : [ o.onClick ]
          : []
        ),
        o.value ? value(o.value) : null
      ])
    }))
  }

  const out = {
    ...createComponent('StringSelect', () => ({
      type: ComponentType.StringSelect,
      placeholder: getPlaceholder(),
      min_values: minValues,
      max_values: maxValues ? Math.min(optionsVal.length, maxValues) : undefined,
      disabled: disabledVal,
      options: getOptions(),
      custom_id: FunctInternals.compileFunctToCustomId(disabledVal ? [] : functVal)
    })),

    placeholder: (text: string) => {
      placeholderVal = text
      return out
    },
    min: (num: number = 1) => {
      minValues = num
      return out
    },
    max: (num: number = 25) => {
      maxValues = num
      return out
    },
    disabled(disabled = true) {
      disabledVal = disabled
      return out
    },
    onSubmit: (...funct: CordoFunctRun) => {
      functVal.push(...funct)
      return out
    },
    setOptions(options: Array<SelectMenuOption<Values>>) {
      optionsVal = options
      return out
    },
    addOption(o: SelectMenuOption<Values>) {
      optionsVal.push(o)
      return out
    }
  }

  return out
}
