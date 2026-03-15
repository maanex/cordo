import { ComponentType, createComponent } from "../component"
import { Hooks } from "../../core/hooks"
import { value, type CordoFunct, type CordoFunctRun } from "../../functions"
import { FunctCompiler } from "../../functions/compiler"
import { MaxLengthConstants } from "../../lib/constants"


type CheckboxGroupOption<Value extends string = string> = ({
  label: string
  description?: string
  default?: boolean
  value?: Value
  onSelect?: CordoFunct | CordoFunctRun
})

export function checkboxGroup<Values extends string = string>() {
  let labelVal: string | undefined = undefined
  let descriptionVal: string | undefined = undefined
  let optionsVal: CheckboxGroupOption[] = []
  let minValues: number | undefined = undefined
  let maxValues: number | undefined = undefined
  let requiredVal: boolean = false
  const functVal: CordoFunct[] = []

  function getLabel() {
    if (!labelVal)
      return 'Pick one'
    return Hooks.callHook(
      'transformUserFacingText',
      labelVal,
      { component: 'CheckboxGroup', position: 'label' }
    )
  }

  function getDescription() {
    if (!descriptionVal)
      return undefined
    return Hooks.callHook(
      'transformUserFacingText',
      descriptionVal,
      { component: 'CheckboxGroup', position: 'description' }
    )
  }

  function getOptions(): CheckboxGroupOption[] {
    return optionsVal.slice(0, 10).map(o => ({
      ...o,
      label: Hooks.callHook('transformUserFacingText', o.label, { component: 'CheckboxGroup', position: 'option.label' })?.slice(0, MaxLengthConstants.SELECT_OPTION_LABEL),
      description: o.description
        ? Hooks.callHook('transformUserFacingText', o.description, { component: 'CheckboxGroup', position: 'option.description' })?.slice(0, MaxLengthConstants.SELECT_OPTION_DESCRIPTION)
        : undefined,
      value: FunctCompiler.toCustomId([
        ...(o.onSelect
          ? Array.isArray(o.onSelect)
            ? o.onSelect
            : [ o.onSelect ]
          : []
        ),
        o.value ? value(o.value) : null
      ])
    }))
  }

  const out = {
    ...createComponent('CheckboxGroup', () => ({
      type: ComponentType.CheckboxGroup,
      label: getLabel(),
      description: getDescription(),
      min_values: Math.max(minValues ?? 1, 0),
      max_values: Math.min(maxValues ?? minValues ?? 1, optionsVal.length),
      required: requiredVal,
      options: getOptions(),
      custom_id: FunctCompiler.toCustomId(requiredVal ? [] : functVal),
      'modal:label': getLabel(),
      'modal:description': getDescription(),
    })),

    required(required = true) {
      requiredVal = required
      return out
    },
    min: (num: number = 1) => {
      minValues = num
      return out
    },
    max: (num: number = 10) => {
      maxValues = num
      return out
    },
    onSubmit: (...funct: CordoFunctRun) => {
      functVal.push(...funct)
      return out
    },
    setOptions(options: Array<CheckboxGroupOption<Values>>) {
      optionsVal = options
      return out
    },
    addOption(o: CheckboxGroupOption<Values>) {
      optionsVal.push(o)
      return out
    },
    withLabel: (text: string) => {
      labelVal = text
      return out
    },
    withDescription: (text: string) => {
      descriptionVal = text
      return out
    },
  }

  return out
}
