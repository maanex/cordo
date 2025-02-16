import { ButtonStyle } from "discord-api-types/v10"
import { ComponentType, createComponent } from "../component"
import { Hooks } from "../../core/hooks"


export function linkButton(url: string) {
  let labelVal: string | undefined = undefined
  let emojiVal: string | undefined = undefined


  function getLabel() {
    if (!labelVal)
      return emojiVal ? '' : new URL(url).hostname

    return Hooks.callHook(
      'transformUserFacingText',
      labelVal,
      { component: 'Button', position: 'label' }
    )
  }

  const out = {
    ...createComponent('Button', () => ({
      type: ComponentType.Button,
      label: getLabel(),
      emoji: emojiVal,
      style: ButtonStyle.Link,
      url
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
