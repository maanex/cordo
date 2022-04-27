import { InteractionEmoji } from "../../types/base"
import { ComponentType, InteractionComponentFlag } from "../../types/const"
import CordoAPI from "../api"
import { Const } from "../types/const"
import { ExactlyOne, OneOrBoth } from "../types/helper"
import { MessageComponent, SerializionContext } from "./$component"


export type ButtonStyle
  = 'PRIMARY' | 'BLUE'
  | 'SECONDARY' | 'GRAY' | 'GREY'
  | 'SUCCESS' | 'GREEN'
  | 'DANGER' | 'RED'

type HelperLabelOrEmoji = OneOrBoth<
  { /** the text on the button */ label: string },
  { /** an emoji on the button */ emoji: Partial<InteractionEmoji> }
>

type HelperStyleOrLink<CustomId extends string> = ExactlyOne<
  { /** button color */ style?: ButtonStyle, /** reference */ customId: CustomId },
  { /** a link to open when the button is clicked */ url: string }
>

export type CreateButtonOptions<CustomId extends string>
  = {
    /** the button will render on screen but will not be clickable */
    disabled?: boolean
    /** the button will be hidden completely and will not count towards the maximum component amount */
    visible?: boolean
    /** flags to control who can interact how */
    flags?: InteractionComponentFlag[]
  }
  & HelperLabelOrEmoji
  & HelperStyleOrLink<CustomId>

type CreateButtonInlineLabel
  = string
  | Partial<InteractionEmoji>
  | [ Partial<InteractionEmoji>, string ]

type ValidUrlPrefixType = 'https://' | 'http://' | 'discord://'

/*
 *
 *
 * 
 */

function withOptions([ options ]: any[]): MessageComponent<ComponentType.BUTTON, string> {
  return {
    customId: options.customId ?? null,
    doRender: !!options.visible,
    serialize: (context?: SerializionContext) => ({
      type: ComponentType.BUTTON,
      label: options.label ?? undefined,
      emoji: options.emoji ?? undefined,
      disabled: options.disabled ?? undefined,
      style: parseButtonStyle(options.style, !!options.customId),
      url: options.url ?? undefined,
      custom_id: generateCustomId(options.customId, options.flags, context)
    })
  }
}

function withUrl([ url, rawLabel, disabled ]: any[]): MessageComponent<ComponentType.BUTTON, string> {
  const [ emoji, label ] = parseInlineLabel(rawLabel)
  return {
    customId: undefined,
    doRender: true,
    serialize: () => ({
      type: ComponentType.BUTTON,
      label,
      emoji,
      disabled,
      style: Const.ButtonStyle.LINK,
      url,
      custom_id: undefined
    })
  }
}

function withCustomId([ customId, rawLabel, style, disabled, rawFlags ]: any[]): MessageComponent<ComponentType.BUTTON, string> {
  const [ emoji, label ] = parseInlineLabel(rawLabel)
  const flags = (typeof rawFlags === 'string')
    ? [ rawFlags ]
    : rawFlags

  return {
    customId,
    doRender: true,
    serialize: (context?: SerializionContext) => ({
      type: ComponentType.BUTTON,
      label,
      emoji,
      disabled,
      style: parseButtonStyle(style, true),
      url: undefined,
      custom_id: generateCustomId(customId, flags, context)
    })
  }
}

//

export function button<ID extends string>(options: CreateButtonOptions<ID>): MessageComponent<ComponentType.BUTTON, ID>
export function button<ID extends string>(customId: ID, label: CreateButtonInlineLabel, style?: ButtonStyle, disabled?: boolean, flags?: InteractionComponentFlag | InteractionComponentFlag[]): MessageComponent<ComponentType.BUTTON, ID>
export function button<ID extends string>(...args: any[]): MessageComponent<ComponentType.BUTTON, ID> {
  if (args.length === 1)
    return withOptions(args) as MessageComponent<ComponentType.BUTTON, ID>

  return withCustomId(args) as MessageComponent<ComponentType.BUTTON, ID>
}
button.link = function (url: `${ValidUrlPrefixType}${string}`, label: CreateButtonInlineLabel, disabled?: boolean): MessageComponent<ComponentType.BUTTON, null> {
  return withUrl([ url, label, disabled ]) as MessageComponent<ComponentType.BUTTON, null>
}

//

function parseButtonStyle(style: ButtonStyle, hasCustomId: boolean): Const.ButtonStyle {
  switch (style) {
    case 'PRIMARY':
    case 'BLUE':
      return Const.ButtonStyle.PRIMARY
    case 'SECONDARY':
    case 'GRAY':
    case 'GREY':
      return Const.ButtonStyle.SECONDARY
    case 'SUCCESS':
    case 'GREEN':
      return Const.ButtonStyle.SUCCESS
    case 'DANGER':
    case 'RED':
      return Const.ButtonStyle.DANGER
    default:
      return hasCustomId
        ? Const.ButtonStyle.SECONDARY
        : Const.ButtonStyle.LINK
  }
}

function parseInlineLabel(label: CreateButtonInlineLabel): [ Partial<InteractionEmoji>, string ] {
  if (typeof label === 'string') return [ undefined, label ]
  if (typeof label === 'object' && ('push' in label))
    return label
  return [ label, undefined ]
}

function generateCustomId(customId: string, flags: InteractionComponentFlag[], context: SerializionContext): string {
  if (!customId) return undefined
  return CordoAPI.compileCustomId(customId, flags, context.id)
}
