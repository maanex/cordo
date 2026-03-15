import { ComponentType, createComponent } from "../component"
import { Hooks } from "../../core/hooks"
import { value, type CordoFunct, type CordoFunctRun } from "../../functions"
import { FunctCompiler } from "../../functions/compiler"
import { MaxLengthConstants } from "../../lib/constants"


type RadioGroupOption<Value extends string = string> = ({
  label: string
  description?: string
  default?: boolean
  value?: Value
  onSelect?: CordoFunct | CordoFunctRun
})

export function radioGroup<Values extends string = string>() {
  let labelVal: string | undefined = undefined
  let descriptionVal: string | undefined = undefined
  let optionsVal: RadioGroupOption[] = []
  let requiredVal: boolean = false
  const functVal: CordoFunct[] = []

  function getLabel() {
    if (!labelVal)
      return 'Pick one'
    return Hooks.callHook(
      'transformUserFacingText',
      labelVal,
      { component: 'RadioGroup', position: 'label' }
    )
  }

  function getDescription() {
    if (!descriptionVal)
      return undefined
    return Hooks.callHook(
      'transformUserFacingText',
      descriptionVal,
      { component: 'RadioGroup', position: 'description' }
    )
  }

  function getOptions(): RadioGroupOption[] {
    return optionsVal.slice(0, 25).map(o => ({
      ...o,
      label: Hooks.callHook('transformUserFacingText', o.label, { component: 'RadioGroup', position: 'option.label' })?.slice(0, MaxLengthConstants.SELECT_OPTION_LABEL),
      description: o.description
        ? Hooks.callHook('transformUserFacingText', o.description, { component: 'RadioGroup', position: 'option.description' })?.slice(0, MaxLengthConstants.SELECT_OPTION_DESCRIPTION)
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
    ...createComponent('RadioGroup', () => ({
      type: ComponentType.RadioGroup,
      label: getLabel(),
      description: getDescription(),
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
    onSubmit: (...funct: CordoFunctRun) => {
      functVal.push(...funct)
      return out
    },
    setOptions(options: Array<RadioGroupOption<Values>>) {
      optionsVal = options
      return out
    },
    addOption(o: RadioGroupOption<Values>) {
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
