import { ButtonStyle } from "discord-api-types/v10"
import { ComponentType, createComponent } from "../component"
import { Hooks } from "../../core/hooks"
import { MaxLengthConstants } from "../../lib/constants"


export function linkButton(url: string) {
  let labelVal: string | undefined = undefined
  let emojiVal: string | undefined = undefined


  function getLabel() {
    if (!labelVal)
      return emojiVal ? '' : new URL(url).hostname.slice(0, MaxLengthConstants.BUTTON_LABEL)

    return Hooks.callHook(
      'transformUserFacingText',
      labelVal,
      { component: 'Button', position: 'label' }
    )?.slice(0, MaxLengthConstants.BUTTON_LABEL)
  }

  const out = {
    ...createComponent('Button', () => ({
      type: ComponentType.Button,
      label: getLabel(),
      emoji: emojiVal,
      style: ButtonStyle.Link,
      url: url?.slice(0, MaxLengthConstants.BUTTON_URL),
    })),

    label: (text: string) => {
      labelVal = text
      return out
    },
    emoji: (emoji: string) => {
      emojiVal = emoji
      return out
    },
  }

  return out
}
