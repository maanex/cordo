import { ComponentType, createComponent } from "../component"
import { Hooks } from "../../core/hooks"
import { value, type CordoFunct, type CordoFunctRun } from "../../functions"
import { FunctCompiler } from "../../functions/compiler"
import { MaxLengthConstants } from "../../lib/constants"
import { CordoMagic } from "../../core/magic"


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
  let ref: string | undefined = undefined
  const functVal: CordoFunct[] = []
  let overrideCustomIdVal: string | undefined = undefined

  function getLabel() {
    if (!labelVal) {
      if (!CordoMagic.getConfig()?.omitWarnings.includes('placeholderTextAppearance'))
        console.warn('A checkbox group was rendered without a label provided. Cordo will use a placeholder label.')
      return 'Pick one'
    }
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
      /** If the custom_id is overriden, use the override value (or an empty custom_id) - otherwise compile the custom_ids and values into the value field */
      value: overrideCustomIdVal
        ? (o.value ?? FunctCompiler.toCustomId([]))
        : FunctCompiler.toCustomId([
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

  const advanced = {
    /** Will override cordo's custom_id generation. Not compatible with onClick handlers */
    rawCustomIds(customId: string) {
      if (!CordoMagic.getConfig()?.omitWarnings.includes('customIdOverride')) {
        if (functVal.length > 0)
          console.warn('You are overriding the custom_id of a checkbox group that has onSubmit handlers. This will prevent the onSubmit handlers from working.')
        if (ref)
          console.warn('You are overriding the custom_id of a checkbox group that has an as() id. Your as() id will be overridden.')
      }
      overrideCustomIdVal = customId
      return out
    }
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
      custom_id: overrideCustomIdVal ?? FunctCompiler.toCustomId([
        ...functVal,
        ...(ref ? [ value(ref) ] : [])
      ]),
      'modal:label': getLabel(),
      'modal:description': getDescription(),
    })),

    as: (id: string) => {
      if (overrideCustomIdVal && !CordoMagic.getConfig()?.omitWarnings.includes('customIdOverride'))
        console.warn('You are assigning an as() id to a checkbox group that already has an overridden custom_id. Your provided id will be ignored.')
      ref = id
      return out
    },
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
      if (overrideCustomIdVal && !CordoMagic.getConfig()?.omitWarnings.includes('customIdOverride'))
        console.warn('You are adding onSubmit handlers to a checkbox group that already has an overridden custom_id. These handlers will not be called.')
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
    /** This namespace contains advanced features you normally do not need */
    advanced
  }

  return out
}
