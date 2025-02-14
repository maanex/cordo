import { type APISelectMenuOption } from "discord-api-types/v10"
import { ComponentType, createComponent } from "../component"
import { FunctInternals, type CordoFunct, type CordoFunctRun } from "../../core/funct"


export function selectString() {
  let placeholderVal: string | undefined = undefined
  let minValues: number | undefined = undefined
  let maxValues: number | undefined = undefined
  let optionsVal: APISelectMenuOption[] = []
  let disabledVal: boolean | undefined = undefined
  const functVal: CordoFunct[] = []

  const out = {
    ...createComponent('StringSelect', () => ({
      type: ComponentType.StringSelect,
      placeholder: placeholderVal,
      min_values: minValues,
      max_values: maxValues,
      disabled: disabledVal,
      options: optionsVal.slice(0, 25),
      custom_id: FunctInternals.compileFunctToCustomId(disabledVal ? [] : functVal)
    })),

    placeholder: (text: string) => {
      placeholderVal = text
      return out
    },
    min: (num: number) => {
      minValues = num
      return out
    },
    max: (num: number) => {
      maxValues = num
      return out
    },
    disabled(disabled = true) {
      disabledVal = disabled
      return out
    },
    onClick: (...funct: CordoFunctRun) => {
      functVal.push(...funct)
      return out
    },
    setOptions(options: APISelectMenuOption[]) {
      optionsVal = options
      return out
    },
    addOption(o: APISelectMenuOption) {
      optionsVal.push(o)
      return out
    }
  }

  return out
}
