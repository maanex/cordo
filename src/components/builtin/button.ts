import { ButtonStyle, type APIEmoji } from "discord-api-types/v10"
import { ComponentType, createComponent } from "../component"
import { FunctInternals, type CordoFunct, type CordoFunctRun } from "../../core/funct"
import { LibEmoji } from "../../lib/emojis"


export function button() {
  let labelVal: string | undefined = undefined
  let emojiVal: APIEmoji | undefined = undefined
  let disabledVal: boolean | undefined = undefined
  let styleVal = ButtonStyle.Secondary
  const functVal: CordoFunct[] = []

  const out = {
    ...createComponent('Button', () => ({
      type: ComponentType.Button,
      label: labelVal ?? (emojiVal ? '' : 'Click'),
      emoji: emojiVal,
      style: styleVal,
      disabled: disabledVal,
      custom_id: FunctInternals.compileFunctToCustomId(disabledVal ? [] : functVal)
    })),

    label: (text: string) => {
      labelVal = text
      return out
    },
    emoji: (emoji: LibEmoji.Input) => {
      emojiVal = LibEmoji.read(emoji)
      return out
    },
    style: (style: 'primary' | 'secondary' | 'success' | 'danger') => {
      if (style === 'primary') styleVal = ButtonStyle.Primary
      else if (style === 'secondary') styleVal = ButtonStyle.Secondary
      else if (style === 'success') styleVal = ButtonStyle.Success
      else if (style === 'danger') styleVal = ButtonStyle.Danger
      return out
    },
    disabled(disabled = true) {
      disabledVal = disabled
      return out
    },
    onClick: (...funct: CordoFunctRun) => {
      functVal.push(...funct)
      return out
    }
  }

  return out
}
