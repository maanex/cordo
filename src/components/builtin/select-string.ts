import { type APISelectMenuOption } from "discord-api-types/v10"
import { ComponentType, createComponent } from "../component"
import { Hooks } from "../../core/hooks"
import { value, type CordoFunct, type CordoFunctRun } from "../../functions"
import { FunctCompiler } from "../../functions/compiler"
import { MaxLengthConstants } from "../../lib/constants"
import { CordoMagic } from "../../core/magic"


type SelectMenuOption<Value extends string = string> = Omit<APISelectMenuOption, 'value'> & ({
  value?: Value
  onClick?: CordoFunct | CordoFunctRun
})

export function selectString<Values extends string = string>() {
  let placeholderVal: string | undefined = undefined
  let labelVal: string | undefined = undefined
  let descriptionVal: string | undefined = undefined
  let minValues: number | undefined = undefined
  let maxValues: number | undefined = undefined
  let optionsVal: SelectMenuOption[] = []
  let disabledVal: boolean | undefined = undefined
  let ref: string | undefined = undefined
  const functVal: CordoFunct[] = []
  let overrideCustomIdVal: string | undefined = undefined

  function getPlaceholder() {
    if (!placeholderVal)
      return undefined
    return Hooks.callHook(
      'transformUserFacingText',
      placeholderVal,
      { component: 'StringSelect', position: 'placeholder' }
    )
  }

  function getLabel() {
    if (!labelVal) {
      if (!CordoMagic.getConfig()?.omitWarnings.includes('placeholderTextAppearance'))
        console.warn('A string select was rendered without a label provided. Cordo will use a placeholder label.')
      return 'Your Response'
    }
    return Hooks.callHook(
      'transformUserFacingText',
      labelVal,
      { component: 'StringSelect', position: 'label' }
    )
  }

  function getDescription() {
    if (!descriptionVal)
      return undefined
    return Hooks.callHook(
      'transformUserFacingText',
      descriptionVal,
      { component: 'StringSelect', position: 'description' }
    )
  }

  function getOptions(): SelectMenuOption[] {
    return optionsVal.slice(0, 25).map(o => ({
      ...o,
      label: Hooks.callHook('transformUserFacingText', o.label, { component: 'StringSelect', position: 'option.label' })?.slice(0, MaxLengthConstants.SELECT_OPTION_LABEL),
      description: o.description
        ? Hooks.callHook('transformUserFacingText', o.description, { component: 'StringSelect', position: 'option.description' })?.slice(0, MaxLengthConstants.SELECT_OPTION_DESCRIPTION)
        : undefined,
      /** If the custom_id is overriden, use the override value (or an empty custom_id) - otherwise compile the custom_ids and values into the value field */
      value: overrideCustomIdVal
        ? (o.value ?? FunctCompiler.toCustomId([]))
        : FunctCompiler.toCustomId([
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

  const advanced = {
    /** Will override cordo's custom_id generation. Not compatible with onClick handlers */
    overrideCustomId(customId: string) {
      if (!CordoMagic.getConfig()?.omitWarnings.includes('customIdOverride')) {
        if (functVal.length > 0)
          console.warn('You are overriding the custom_id of a string select that has onSubmit handlers. This will prevent the onSubmit handlers from working.')
        if (ref)
          console.warn('You are overriding the custom_id of a string select that has an as() id. Your as() id will be overridden.')
      }
      overrideCustomIdVal = customId
      return out
    }
  }

  const out = {
    ...createComponent('StringSelect', () => ({
      type: ComponentType.StringSelect,
      placeholder: getPlaceholder(),
      min_values: minValues,
      max_values: maxValues ? Math.min(optionsVal.length, maxValues) : undefined,
      disabled: disabledVal,
      options: getOptions(),
      custom_id: overrideCustomIdVal ?? FunctCompiler.toCustomId([
        ...(disabledVal ? [] : functVal),
        ...(ref ? [ value(ref) ] : [])
      ]),
      'modal:label': getLabel(),
      'modal:description': getDescription(),
    })),

    as: (id: string) => {
      if (overrideCustomIdVal && !CordoMagic.getConfig()?.omitWarnings.includes('customIdOverride'))
        console.warn('You are assigning an as() id to a string select that already has an overridden custom_id. Your provided id will be ignored.')
      ref = id
      return out
    },
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
      if (overrideCustomIdVal && !CordoMagic.getConfig()?.omitWarnings.includes('customIdOverride'))
        console.warn('You are adding onSubmit handlers to a string select that already has an overridden custom_id. These handlers will not be called.')
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
    advanced,
  }

  return out
}
