import { ButtonStyle, type APIEmoji } from "discord-api-types/v10"
import { ComponentType, createComponent } from "../component"
import { LibEmoji } from "../../lib/emoji"
import { Hooks } from "../../core/hooks"
import type { CordoFunct, CordoFunctRun } from "../../functions"
import { FunctCompiler } from "../../functions/compiler"
import { MaxLengthConstants } from "../../lib/constants"
import { CordoMagic } from "../../core/magic"


export function button() {
  let labelVal: string | undefined = undefined
  let emojiVal: APIEmoji | undefined = undefined
  let disabledVal: boolean | undefined = undefined
  let styleVal = ButtonStyle.Secondary
  const functVal: CordoFunct[] = []
  let overrideCustomIdVal: string | undefined = undefined

  function getLabel() {
    if (!labelVal) {
      if (emojiVal)
        return ''
      if (!CordoMagic.getConfig()?.omitWarnings.includes('placeholderTextAppearance'))
        console.warn('A button was rendered with neither a label or an emoji provided. Cordo will use a placeholder label.')
      return 'Click'
    }

    return Hooks.callHook(
      'transformUserFacingText',
      labelVal,
      { component: 'Button', position: 'label' }
    )?.slice(0, MaxLengthConstants.BUTTON_LABEL)
  }

  const advanced = {
    /** Will override cordo's custom_id generation. Not compatible with onClick handlers */
    overrideCustomId(customId: string) {
      if (functVal.length > 0 && !CordoMagic.getConfig()?.omitWarnings.includes('customIdOverride'))
        console.warn('You are overriding the custom_id of a button that has onClick handlers. This will prevent the onClick handlers from working.')
      overrideCustomIdVal = customId
      return out
    }
  }

  const out = {
    ...createComponent('Button', () => ({
      type: ComponentType.Button,
      label: getLabel(),
      emoji: emojiVal,
      style: styleVal,
      disabled: disabledVal,
      custom_id: overrideCustomIdVal ?? FunctCompiler.toCustomId(disabledVal ? [] : functVal)
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
      if (style === 'primary')
        styleVal = ButtonStyle.Primary
      else if (style === 'secondary')
        styleVal = ButtonStyle.Secondary
      else if (style === 'success')
        styleVal = ButtonStyle.Success
      else if (style === 'danger')
        styleVal = ButtonStyle.Danger
      return out
    },
    disabled(disabled = true, opts?: { greyOut?: boolean }) {
      disabledVal = disabled
      if (disabled && opts?.greyOut)
        styleVal = ButtonStyle.Secondary
      return out
    },
    onClick: (...funct: CordoFunctRun) => {
      if (overrideCustomIdVal && !CordoMagic.getConfig()?.omitWarnings.includes('customIdOverride'))
        console.warn('You are adding onClick handlers to a button that already has an overridden custom_id. These handlers will not be called.')
      functVal.push(...funct)
      return out
    },
    /** This namespace contains advanced features you normally do not need */
    advanced
  }

  return out
}
