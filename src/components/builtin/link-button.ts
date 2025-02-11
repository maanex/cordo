import { ButtonStyle } from "discord-api-types/v10"
import { ComponentType, createComponent } from "../component"


export function linkButton(url: string) {
  let labelVal: string | undefined = undefined
  let emojiVal: string | undefined = undefined

  const out = {
    ...createComponent('Button', () => ({
      type: ComponentType.Button,
      label: labelVal ?? (emojiVal ? '' : new URL(url).hostname),
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
