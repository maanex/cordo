import { ComponentType, createComponent } from "../component"
import { Hooks } from "../../core/hooks"


export function textInput(name: string) {
  let placeholderVal: string | undefined = undefined
  let labelVal: string | undefined = undefined
  let minLength: number | undefined = undefined
  let maxLength: number | undefined = undefined
  let requiredVal: boolean | undefined = undefined
  let sizeVal: number | undefined = undefined

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
      return undefined
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
      custom_id: name
    })),

    placeholder: (text: string) => {
      placeholderVal = text
      return out
    },
    label: (text: string) => {
      labelVal = text
      return out
    },
    min: (num: number = 1) => {
      minLength = num
      return out
    },
    max: (num: number = 25) => {
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
