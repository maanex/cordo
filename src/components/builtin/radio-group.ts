import { ComponentType, createComponent } from "../component"
import { Hooks } from "../../core/hooks"
import { value, type CordoFunct, type CordoFunctRun } from "../../functions"
import { FunctCompiler } from "../../functions/compiler"
import { MaxLengthConstants } from "../../lib/constants"
import { CordoMagic } from "../../core/magic"


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
  let ref: string | undefined = undefined
  const functVal: CordoFunct[] = []
  let overrideCustomIdVal: string | undefined = undefined

  function getLabel() {
    if (!labelVal) {
      if (!CordoMagic.getConfig()?.omitWarnings.includes('placeholderTextAppearance'))
        console.warn('A radio group was rendered without a label provided. Cordo will use a placeholder label.')
      return 'Pick one'
    }
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
    /** Will override cordo's custom_id generation. Not compatible with onSubmit handlers */
    overrideCustomId(customId: string) {
      if (!CordoMagic.getConfig()?.omitWarnings.includes('customIdOverride')) {
        if (functVal.length > 0)
          console.warn('You are overriding the custom_id of a radio group that has onSubmit handlers. This will prevent the onSubmit handlers from working.')
        if (ref)
          console.warn('You are overriding the custom_id of a radio group that has an as() id. Your as() id will be overridden.')
      }
      overrideCustomIdVal = customId
      return out
    }
  }

  const out = {
    ...createComponent('RadioGroup', () => ({
      type: ComponentType.RadioGroup,
      label: getLabel(),
      description: getDescription(),
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
        console.warn('You are assigning an as() id to a radio group that already has an overridden custom_id. Your provided id will be ignored.')
      ref = id
      return out
    },
    required(required = true) {
      requiredVal = required
      return out
    },
    onSubmit: (...funct: CordoFunctRun) => {
      if (overrideCustomIdVal && !CordoMagic.getConfig()?.omitWarnings.includes('customIdOverride'))
        console.warn('You are adding onSubmit handlers to a radio group that already has an overridden custom_id. These handlers will not be called.')
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
    /** This namespace contains advanced features you normally do not need */
    advanced
  }

  return out
}
