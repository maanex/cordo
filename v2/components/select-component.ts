import { MessageComponentSelectOption } from "../../types/component"
import { ComponentType, InteractionComponentFlag } from "../../types/const"
import CordoAPI from "../api"
import { ExactlyOne } from "../types/helper"
import { MessageComponent, SerializionContext } from "./$component"

export type SelectOptionsPresets
  = 'USERS'
  | 'ROLES'
  | 'MENTIONABLES'
  | 'CHANNELS'

export type AutoSelectTypes
  = ComponentType.USER_SELECT
  | ComponentType.ROLE_SELECT
  | ComponentType.MENTIONABLE_SELECT
  | ComponentType.CHANNEL_SELECT

export type AllSelectTypes
  = ComponentType.SELECT
  | AutoSelectTypes

type HelperSelectData = ExactlyOne<
  { options: MessageComponentSelectOption[] },
  { options: SelectOptionsPresets }
>

export type CreateSelectOptions<CustomId extends string>
  = {
    /** the custom id of this component */
    customId: CustomId
    /** the select will render on screen but will not be clickable */
    disabled?: boolean
    /** the select will be hidden completely and will not count towards the maximum component amount */
    visible?: boolean
    /** placeholder text when no option is selected */
    placeholder?: string
    /** minimum amount of values a user has to select */
    minValues?: number
    /** maximum amount of values a user can select */
    maxValues?: number
    /** flags to control who can interact how */
    flags?: InteractionComponentFlag[]
  }
  & HelperSelectData

/*
 *
 *
 * 
 */

function withOptions([ options ]: any[]): MessageComponent<AllSelectTypes, string> {
  return {
    customId: options.customId,
    doRender: !!options.visible,
    serialize: (context?: SerializionContext) => ({
      ...parseOptionsPreset(options.options),
      disabled: options.disabled ?? undefined,
      placeholder: options.placeholder ?? undefined,
      min_values: options.minValues ?? undefined,
      max_values: options.maxValues ?? undefined,
      custom_id: generateCustomId(options.customId, options.flags, context)
    })
  }
}

function withCustomId([ customId, options, placeholder, disabled, rawFlags ]: any[]): MessageComponent<AllSelectTypes, string> {
  return {
    customId,
    doRender: true,
    serialize: (context?: SerializionContext) => ({
      type: ComponentType.SELECT,
      disabled: disabled ?? undefined,
      placeholder: placeholder ?? undefined,
      options: options ?? undefined,
      min_values: undefined,
      max_values: undefined,
      custom_id: generateCustomId(customId, rawFlags, context)
    })
  }
}

//

export function select<ID extends string>(options: CreateSelectOptions<ID>): MessageComponent<AllSelectTypes, ID>
export function select<ID extends string>(customId: ID, options?: MessageComponentSelectOption[], placeholder?: string, disabled?: boolean, flags?: InteractionComponentFlag | InteractionComponentFlag[]): MessageComponent<ComponentType.SELECT, ID>
export function select<ID extends string>(...args: any[]): MessageComponent<AllSelectTypes, ID> {
  if (args.length === 1)
    return withOptions(args) as MessageComponent<AllSelectTypes, ID>

  return withCustomId(args) as MessageComponent<ComponentType.SELECT, ID>
}
select.users = function <ID extends string> (customId: ID, disabled?: boolean): MessageComponent<ComponentType.USER_SELECT, ID> {
  return withOptions([
    { type: ComponentType.USER_SELECT, customId, disabled }
  ]) as MessageComponent<ComponentType.USER_SELECT, ID>
}
select.roles = function <ID extends string> (customId: ID, disabled?: boolean): MessageComponent<ComponentType.ROLE_SELECT, ID> {
  return withOptions([
    { type: ComponentType.ROLE_SELECT, customId, disabled }
  ]) as MessageComponent<ComponentType.ROLE_SELECT, ID>
}
select.mentionable = function <ID extends string> (customId: ID, disabled?: boolean): MessageComponent<ComponentType.MENTIONABLE_SELECT, ID> {
  return withOptions([
    { type: ComponentType.MENTIONABLE_SELECT, customId, disabled }
  ]) as MessageComponent<ComponentType.MENTIONABLE_SELECT, ID>
}
select.channel = function <ID extends string> (customId: ID, disabled?: boolean): MessageComponent<ComponentType.CHANNEL_SELECT, ID> {
  return withOptions([
    { type: ComponentType.CHANNEL_SELECT, customId, disabled }
  ]) as MessageComponent<ComponentType.CHANNEL_SELECT, ID>
}

//

function parseOptionsPreset(type: SelectOptionsPresets | MessageComponentSelectOption): { type: AllSelectTypes, options?: MessageComponentSelectOption } {
  if (typeof type !== 'string') {
    return {
      type: ComponentType.SELECT,
      options: type
    }
  }

  switch (type) {
    case 'USERS':
      return { type: ComponentType.USER_SELECT }
    case 'ROLES':
      return { type: ComponentType.ROLE_SELECT }
    case 'MENTIONABLES':
      return { type: ComponentType.MENTIONABLE_SELECT }
    case 'CHANNELS':
      return { type: ComponentType.CHANNEL_SELECT }
  }
}

function generateCustomId(customId: string, flags: InteractionComponentFlag[], context: SerializionContext): string {
  if (!customId) return undefined
  return CordoAPI.compileCustomId(customId, flags, context.id)
}
