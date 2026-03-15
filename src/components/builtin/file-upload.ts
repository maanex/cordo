import { ComponentType, createComponent } from "../component"
import { Hooks } from "../../core/hooks"
import { type CordoFunct, type CordoFunctRun } from "../../functions"
import { FunctCompiler } from "../../functions/compiler"


export function fileUpload() {
  let labelVal: string | undefined = undefined
  let descriptionVal: string | undefined = undefined
  let minValues: number | undefined = undefined
  let maxValues: number | undefined = undefined
  let requiredVal: boolean = false
  const functVal: CordoFunct[] = []

  function getLabel() {
    if (!labelVal)
      return 'Your Response'
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

  const out = {
    ...createComponent('FileUpload', () => ({
      type: ComponentType.FileUpload,
      label: getLabel(),
      description: getDescription(),
      min_values: Math.max(minValues ?? 1, 0),
      max_values: Math.min(maxValues ?? minValues ?? 1, 10),
      required: requiredVal,
      custom_id: FunctCompiler.toCustomId(functVal),
      'modal:label': getLabel(),
      'modal:description': getDescription(),
    })),

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
  }

  return out
}
