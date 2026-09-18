import { ComponentType, createComponent } from "../component"
import { Hooks } from "../../core/hooks"
import { FunctCompiler } from "../../functions/compiler"
import { value } from "../../functions"
import { CordoMagic } from "../../core/magic"


export function textInput() {
  let placeholderVal: string | undefined = undefined
  let labelVal: string | undefined = undefined
  let descriptionVal: string | undefined = undefined
  let minLength: number | undefined = undefined
  let maxLength: number | undefined = undefined
  let requiredVal: boolean = false
  let sizeVal: number | undefined = undefined
  let currentVal: string | undefined = undefined
  let ref: string | undefined = undefined
  let overrideCustomIdVal: string | undefined = undefined

  function getPlaceholder() {
    if (!placeholderVal)
      return undefined
    return Hooks.callHook(
      'transformUserFacingText',
      placeholderVal,
      { component: 'TextInput', position: 'placeholder' }
    )
  }

  function getLabel() {
    if (!labelVal) {
      if (!CordoMagic.getConfig()?.omitWarnings.includes('placeholderTextAppearance'))
        console.warn('A text input was rendered without a label provided. Cordo will use a placeholder label.')
      return 'Your Response'
    }
    return Hooks.callHook(
      'transformUserFacingText',
      labelVal,
      { component: 'TextInput', position: 'label' }
    )
  }

  function getDescription() {
    if (!descriptionVal)
      return undefined
    return Hooks.callHook(
      'transformUserFacingText',
      descriptionVal,
      { component: 'TextInput', position: 'description' }
    )
  }

  const advanced = {
    /** Will override cordo's custom_id generation. Not compatible with onClick handlers */
    overrideCustomId(customId: string) {
      if (ref && !CordoMagic.getConfig()?.omitWarnings.includes('customIdOverride'))
        console.warn('You are overriding the custom_id of a text input that has an as() id. Your as() id will be overridden.')
      overrideCustomIdVal = customId
      return out
    }
  }

  const out = {
    ...createComponent('TextInput', () => ({
      type: ComponentType.TextInput,
      placeholder: getPlaceholder(),
      min_length: minLength,
      max_length: maxLength,
      required: requiredVal,
      style: sizeVal ?? 1,
      value: currentVal,
      custom_id: overrideCustomIdVal ?? FunctCompiler.toCustomId(ref ? [ value(ref) ] : []), // get a noop if no ref
      'modal:label': getLabel(),
      'modal:description': getDescription(),
    })),

    as: (id: string) => {
      if (overrideCustomIdVal && !CordoMagic.getConfig()?.omitWarnings.includes('customIdOverride'))
        console.warn('You are assigning an as() id to a text input that already has an overridden custom_id. Your provided id will be ignored.')
      ref = id
      return out
    },
    placeholder: (text: string) => {
      placeholderVal = text
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
    current: (text: string) => {
      currentVal = text
      return out
    },
    min: (num: number = 0) => {
      if (num < 0) num = 0
      if (num > 4000) num = 4000
      minLength = num
      return out
    },
    max: (num: number = 4000) => {
      if (num < 1) num = 1
      if (num > 4000) num = 4000
      maxLength = num
      return out
    },
    required(required = true) {
      requiredVal = required
      return out
    },
    size: (size: 'single' | 'multi') => {
      sizeVal = (size === 'single')
        ? 1
        : (size === 'multi')
          ? 2
          : undefined
      return out
    },
    /** This namespace contains advanced features you normally do not need */
    advanced
  }

  return out
}
