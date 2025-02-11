import { ButtonStyle } from "discord-api-types/v10"
import { ComponentType, createComponent } from "../component"
import { FunctInternals, type CordoFunct, type CordoFunctRun } from "../../core/funct"


export function button() {
  let labelVal: string | undefined = undefined
  let emojiVal: string | undefined = undefined
  let styleVal = ButtonStyle.Secondary
  const functVal: CordoFunct[] = []

  const out = {
    ...createComponent('Button', () => ({
      type: ComponentType.Button,
      label: labelVal ?? (emojiVal ? '' : 'Click'),
      emoji: emojiVal,
      style: styleVal,
      custom_id: FunctInternals.compileFunctToCustomId(functVal)
    })),

    label: (text: string) => {
      labelVal = text
      return out
    },
    emoji: (emoji: string) => {
      emojiVal = emoji
      return out
    },
    style: (style: 'primary' | 'secondary' | 'success' | 'danger') => {
      if (style === 'primary') styleVal = ButtonStyle.Primary
      else if (style === 'secondary') styleVal = ButtonStyle.Secondary
      else if (style === 'success') styleVal = ButtonStyle.Success
      else if (style === 'danger') styleVal = ButtonStyle.Danger
      return out
    },
    onClick: (...funct: CordoFunctRun) => {
      functVal.push(...funct)
      return out
    }
  }

  return out
}
