import { ComponentType, createComponent } from "../component"
import { Hooks } from "../../core/hooks"


export function textInput() {
  let placeholderVal: string | undefined = undefined
  let labelVal: string | undefined = undefined
  let minLength: number | undefined = undefined
  let maxLength: number | undefined = undefined
  let requiredVal: boolean | undefined = undefined
  let sizeVal: number | undefined = undefined
  let currentVal: string | undefined = undefined
  let ref: string | undefined = undefined

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
    if (!labelVal)
      return 'Your response'
    return Hooks.callHook(
      'transformUserFacingText',
      labelVal,
      { component: 'TextInput', position: 'label' }
    )
  }

  const out = {
    ...createComponent('TextInput', () => ({
      type: ComponentType.TextInput,
      placeholder: getPlaceholder(),
      label: getLabel(),
      min_length: minLength,
      max_length: maxLength,
      required: requiredVal,
      size: sizeVal ?? 1,
      value: currentVal,
      custom_id: ref
    })),

    as: (id: string) => {
      ref = id
      return out
    },
    placeholder: (text: string) => {
      placeholderVal = text
      return out
    },
    label: (text: string) => {
      labelVal = text
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
    }
  }

  return out
}
