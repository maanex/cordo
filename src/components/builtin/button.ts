import { ButtonStyle, type APIEmoji } from "discord-api-types/v10"
import { ComponentType, createComponent } from "../component"
import { FunctInternals, type CordoFunct, type CordoFunctRun } from "../../core/funct"
import { LibEmoji } from "../../lib/emoji"
import { Hooks } from "../../core/hooks"


export function button() {
  let labelVal: string | undefined = undefined
  let emojiVal: APIEmoji | undefined = undefined
  let disabledVal: boolean | undefined = undefined
  let visibleVal: boolean = true
  let styleVal = ButtonStyle.Secondary
  const functVal: CordoFunct[] = []

  function getLabel() {
    if (!labelVal)
      return emojiVal ? '' : 'Click'

    return Hooks.callHook(
      'transformUserFacingText',
      labelVal,
      { component: 'Button', position: 'label' }
    )
  }

  const out = {
    ...createComponent('Button', () => visibleVal ? ({
      type: ComponentType.Button,
      label: getLabel(),
      emoji: emojiVal,
      style: styleVal,
      disabled: disabledVal,
      custom_id: FunctInternals.compileFunctToCustomId(disabledVal ? [] : functVal)
    }) : null),

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
    visible(visible = true) {
      visibleVal = visible
      return out
    },
    onClick: (...funct: CordoFunctRun) => {
      functVal.push(...funct)
      return out
    }
  }

  return out
}
