/* eslint-disable camelcase */
// INTERACTION BASE TYPES

import { InteractionCallbackFollowup, InteractionOpenModalData } from '..'
import { InteractionApplicationCommandCallbackData, InteractionReplyStateLevelTwo } from './custom'
import { InteractionCommandType, ComponentType, ChannelType, InteractionComponentFlag, InteractionType, ApplicationCommandOptionType, EntitlementType } from './const'
import { GuildData, UserData } from './middleware'
import { MessageComponent } from './component'


export type Snowflake = string

export type PermissionBits = string


export type CommandArgumentChoice = {
  name: string
  value: string
}

export type InteractionUser = {
  id: Snowflake
  username: string
  avatar: string
  discriminator: string
  public_flags: number
  bot: boolean
}

export type InteractionMember = {
  user: InteractionUser
  roles: Snowflake[]
  premium_since: string | null
  permissions: PermissionBits
  pending: boolean
  nick: string | null
  mute: boolean
  joined_at: string
  is_pending: boolean
  deaf: boolean
}

export type PartialInteractionMember = Omit<InteractionMember, 'user' | 'mute' | 'deaf'>

export type PartialInteractionChannel = {
  id: Snowflake
  name: string
  type: ChannelType
  permissions: Snowflake
}

export type InteractionMessageAttachment = {
  id: Snowflake
  filename: string
  content_type?: string
  size: number
  url: string
  proxy_url: string
  height?: number
  width?: number
}

export type InteractionMessage = {
  webhook_id?: string
  type: number
  tts: boolean
  timestamp: string
  pinned: boolean
  mentions: any[] // TODO
  mention_roles: any[] // TODO
  mention_everyone: boolean
  interaction?: {
    user: InteractionUser
    type: number
    name: string
    id: string
  }
  id: Snowflake
  flags: number
  embeds: any[] // TODO
  edited_timestamp: string | null
  content: string
  components: any // TODO
  channel_id: string
  author: InteractionUser
  attachments: InteractionMessageAttachment[]
  application_id: string
}

export type PartialInteractionMessage = InteractionMessage // TODO

export type MessageEmbed = {
  title?: string
  type?: 'rich' | 'image' | 'video' | 'gifv' | 'article' | 'link'
  description?: string
  url?: string
  timestamp?: number
  color?: number
  footer?: {
    text: string
    icon_url?: string
    proxy_icon_url?: string
  }
  image?: {
    url: string
    proxy_url?: string
    height?: number
    width?: number
  }
  thumbnail?: {
    url: string
    proxy_url?: string
    height?: number
    width?: number
  }
  video?: {
    url: string
    proxy_url?: string
    height?: number
    width?: number
  }
  provider?: {
    name?: string
    url?: string
  }
  author?: {
    name: string
    url?: string
    icon_url?: string
    proxy_icon_url?: string
  }
  fields?: {
    name: string
    value: string
    inline?: boolean
  }[]
}

export type InteractionEmoji = {
  id: Snowflake
  name: string
  animated: boolean
}

export type InteractionRole = {
  id: Snowflake
  name: string
  color: number
  hoist: boolean
  position: number
  permissions: PermissionBits
  managed: boolean
  mentionable: boolean
  tags?: {
    bot_id?: Snowflake
    integration_id?: Snowflake
    premium_subscriber?: null
  }
}

export type InteractionResolvedData = {
  users?: Record<Snowflake, InteractionUser>
  members?: Record<Snowflake, PartialInteractionMember>
  roles?: Record<Snowflake, InteractionRole>
  channels?: Record<Snowflake, PartialInteractionChannel>
  messages?: Record<Snowflake, PartialInteractionMessage>
}

export type InteractionTypeCommandOptionsRegular = {
  type: Omit<ApplicationCommandOptionType, ApplicationCommandOptionType.SUB_COMMAND>
  name: string
  value: string | number
  options: undefined
}

export type InteractionTypeCommandOptionsSubCommand = {
  type: ApplicationCommandOptionType.SUB_COMMAND
  name: string
  value: undefined
  options: InteractionTypeCommandOptions[]
}

export type InteractionTypeCommandOptions
  = InteractionTypeCommandOptionsRegular
  | InteractionTypeCommandOptionsSubCommand

export type Entitlement = {
  application_id: string
  consumed: boolean
  deleted: boolean
  gift_code_flags: number
  guild_id: string
  id: string
  promotion_id: string | null
  sku_id: string
  type: EntitlementType
  user_id: string
}

//

export type InteractionLocationGuild = {
  member: InteractionMember
  user?: InteractionUser
  guild_id: Snowflake
  channel_id: Snowflake
}

export type InteractionLocationDM = {
  member?: undefined
  user: InteractionUser
  guild_id?: undefined
  channel_id?: undefined
}

//

export type InteractionTypeCommand = {
  type: InteractionType.COMMAND
  message?: undefined
  data: {
    id: Snowflake
    name: string
    resolved: InteractionResolvedData
    options?: InteractionTypeCommandOptions[]
    option?: { [name: string]: string | number } // custom parsed
  } & ({
    type: InteractionCommandType.CHAT_INPUT
  } | {
    type: InteractionCommandType.USER
    target_id: Snowflake
    target: InteractionUser // custom parsed
  } | {
    type: InteractionCommandType.MESSAGE
    target_id: Snowflake
    target: InteractionMessage // custom parsed
  })
}

export type InteractionTypeComponent = {
  type: InteractionType.COMPONENT
  message: InteractionMessage
  data: {
    commponent_type: ComponentType.BUTTON | ComponentType.SELECT
    custom_id: string
    values?: string[]
    flags: InteractionComponentFlag[]
  }
}

export type InteractionTypeCommandAutocomplete = {
  type: InteractionType.COMMAND_AUTOCOMPLETE
  data: {
    id: Snowflake
    name: string
    type: InteractionCommandType
    version: Snowflake
    options: {
      type: ApplicationCommandOptionType
      name: string
      value: string
      focused: boolean
    }[]
    input: string // custom parsed
  }
}

export type InteractionTypeModalSubmit = {
  type: InteractionType.MODAL_SUBMIT,
  data: {
    custom_id: string
    components: MessageComponent[]
    /** parsed components, { [custom_id]: value } */
    data: Record<string, any>
  }
}

//

export type InteractionBase = {
  id: Snowflake
  token: string
  version: number
  user: InteractionUser
  application_id?: Snowflake
  locale?: string
  guild_locale?: string
  entitlement_sku_ids?: string[],
  entitlements?: Entitlement[]

  guildData?: GuildData
  userData?: UserData
  _answered: boolean
  _httpCallback?: (payload: any) => any
  _answerComponents: MessageComponent[]
}

//

export type GenericInteraction
  = InteractionBase
  & (InteractionLocationGuild | InteractionLocationDM)
  & (InteractionTypeCommand | InteractionTypeComponent | InteractionTypeCommandAutocomplete | InteractionTypeModalSubmit)
export type CommandInteraction
  = InteractionBase
  & (InteractionLocationGuild | InteractionLocationDM)
  & InteractionTypeCommand
export type ComponentInteraction
  = InteractionBase
  & (InteractionLocationGuild | InteractionLocationDM)
  & InteractionTypeComponent
export type CommandAutocompleteInteraction
  = InteractionBase
  & (InteractionLocationGuild | InteractionLocationDM)
  & InteractionTypeCommandAutocomplete
export type ModalSubmitInteraction
  = InteractionBase
  & (InteractionLocationGuild | InteractionLocationDM)
  & InteractionTypeModalSubmit
export type SlottedContext = { params: Record<string, string> }
export type SlotableInteraction
  = GenericInteraction
  & SlottedContext

export type ReplyableCommandInteraction = CommandInteraction & Partial<SlottedContext> & {
  defer(privately?: boolean): Promise<InteractionCallbackFollowup>
  reply(data: InteractionApplicationCommandCallbackData): Promise<InteractionCallbackFollowup>
  replyInteractive(data: InteractionApplicationCommandCallbackData): InteractionReplyStateLevelTwo
  replyPrivately(data: InteractionApplicationCommandCallbackData): void
  openModal(data: InteractionOpenModalData): void
  state(state?: string, ...args: any): void
}

export type ReplyableComponentInteraction = ComponentInteraction & Partial<SlottedContext> & {
  ack(): void
  reply(data: InteractionApplicationCommandCallbackData): Promise<InteractionCallbackFollowup>
  replyInteractive(data: InteractionApplicationCommandCallbackData): InteractionReplyStateLevelTwo
  replyPrivately(data: InteractionApplicationCommandCallbackData): void
  edit(data: InteractionApplicationCommandCallbackData): void
  editInteractive(data: InteractionApplicationCommandCallbackData): InteractionReplyStateLevelTwo
  openModal(data: InteractionOpenModalData): void
  // disableComponents(): void
  removeComponents(): void
  state(state?: string, ...args: any): void
}

export type ReplyableCommandAutocompleteInteraction = CommandAutocompleteInteraction & {
  ack(): void
  show(choices: CommandArgumentChoice[]): void
}

// TODO modal
// export type ReplyableCommandAutocompleteInteraction = CommandAutocompleteInteraction & {
//   ack(): void
//   show(choices: CommandArgumentChoice[]): void
// }

export type InteractionJanitor = {
  edit(data: InteractionApplicationCommandCallbackData): void
  disableComponents(): void
  removeComponents(): void
  state(state?: string, ...args: any): void
}
