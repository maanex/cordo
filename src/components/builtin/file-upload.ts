import { ComponentType, createComponent } from "../component"
import { Hooks } from "../../core/hooks"
import { value, type CordoFunct, type CordoFunctRun } from "../../functions"
import { FunctCompiler } from "../../functions/compiler"
import { CordoMagic } from "../../core/magic"


export function fileUpload() {
  let labelVal: string | undefined = undefined
  let descriptionVal: string | undefined = undefined
  let minValues: number | undefined = undefined
  let maxValues: number | undefined = undefined
  let requiredVal: boolean = false
  let ref: string | undefined = undefined
  const functVal: CordoFunct[] = []
  let overrideCustomIdVal: string | undefined = undefined

  function getLabel() {
    if (!labelVal) {
      if (!CordoMagic.getConfig()?.omitWarnings.includes('placeholderTextAppearance'))
        console.warn('A file upload was rendered without a label provided. Cordo will use a placeholder label.')
      return 'Your response'
    }
    return Hooks.callHook(
      'transformUserFacingText',
      labelVal,
      { component: 'FileUpload', position: 'label' }
    )
  }

  function getDescription() {
    if (!descriptionVal)
      return undefined
    return Hooks.callHook(
      'transformUserFacingText',
      descriptionVal,
      { component: 'FileUpload', position: 'description' }
    )
  }

  const advanced = {
    /** Will override cordo's custom_id generation. Not compatible with onSubmit handlers */
    overrideCustomId(customId: string) {
      if (!CordoMagic.getConfig()?.omitWarnings.includes('customIdOverride')) {
        if (functVal.length > 0)
          console.warn('You are overriding the custom_id of a file upload that has onSubmit handlers. This will prevent the onSubmit handlers from working.')
        if (ref)
          console.warn('You are overriding the custom_id of a file upload that has an as() id. Your as() id will be overridden.')
      }
      overrideCustomIdVal = customId
      return out
    }
  }

  const out = {
    ...createComponent('FileUpload', () => ({
      type: ComponentType.FileUpload,
      label: getLabel(),
      description: getDescription(),
      min_values: Math.max(minValues ?? 1, 0),
      max_values: Math.min(maxValues ?? minValues ?? 1, 10),
      required: requiredVal,
      custom_id: overrideCustomIdVal ?? FunctCompiler.toCustomId([
        ...functVal,
        ...(ref ? [ value(ref) ] : [])
      ]),
      'modal:label': getLabel(),
      'modal:description': getDescription(),
    })),

    as: (id: string) => {
      if (overrideCustomIdVal && !CordoMagic.getConfig()?.omitWarnings.includes('customIdOverride'))
        console.warn('You are assigning an as() id to a file upload that already has an overridden custom_id. Your provided id will be ignored.')
      ref = id
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
    required(required = true) {
      requiredVal = required
      return out
    },
    onSubmit: (...funct: CordoFunctRun) => {
      if (overrideCustomIdVal && !CordoMagic.getConfig()?.omitWarnings.includes('customIdOverride'))
        console.warn('You are adding onSubmit handlers to a file upload that already has an overridden custom_id. These handlers will not be called.')
      functVal.push(...funct)
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
