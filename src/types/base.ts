/* eslint-disable camelcase */
// INTERACTION BASE TYPES

import { InteractionApplicationCommandCallbackData, InteractionReplyStateLevelTwo } from './custom'
import { InteractionCommandType, ComponentType, InteractionComponentFlag, InteractionType } from './const'
import { GuildData, UserData } from './middleware'
import { MessageComponent } from './component'


export type Snowflake = string

export type PermissionBits = string


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
  webhook_id?: string,
  type: number,
  tts: boolean,
  timestamp: string,
  pinned: boolean,
  mentions: any[], // TODO
  mention_roles: any[], // TODO
  mention_everyone: boolean,
  interaction?: {
    user: InteractionUser,
    type: number,
    name: string,
    id: string
  },
  id: Snowflake,
  flags: number,
  embeds: any[], // TODO
  edited_timestamp: string | null,
  content: string,
  components: any, // TODO
  channel_id: string,
  author: InteractionUser,
  attachments: InteractionMessageAttachment[], // TODO
  application_id: string
}

export type PartialInteractionMessage = InteractionMessage // TODO

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
    bot_id?: Snowflake,
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
    options?: {
      name: string
      value: string | number
    }[],
    option?: { [name: string]: string | number } // custom, parsed
  } & ({
    type: InteractionCommandType.CHAT_INPUT
  } | {
    type: InteractionCommandType.USER
    target_id: Snowflake
    target: InteractionUser
  } | {
    type: InteractionCommandType.MESSAGE
    target_id: Snowflake
    target: InteractionMessage
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

export type InteractionTypeRichMessage = {
  type: InteractionType.RICH_MESSAGE
}

//

export type InteractionBase = {
  id: Snowflake
  token: string
  version: number
  user: InteractionUser
  application_id?: Snowflake
  guildData?: GuildData
  userData?: UserData
  _answered: boolean
  _answerComponents: MessageComponent[]
}

//

export type GenericInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & (InteractionTypeCommand | InteractionTypeComponent | InteractionTypeRichMessage)
export type CommandInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & InteractionTypeCommand
export type ComponentInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & InteractionTypeComponent
export type RichMessageInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & InteractionTypeRichMessage
export type SlotedContext = { params: Record<string, string> }

export type ReplyableCommandInteraction = CommandInteraction & {
  ack(): void
  reply(data: InteractionApplicationCommandCallbackData): void
  replyInteractive(data: InteractionApplicationCommandCallbackData): InteractionReplyStateLevelTwo
  replyPrivately(data: InteractionApplicationCommandCallbackData): void
  state(state?: string, ...args: any): void
}

export type ReplyableComponentInteraction = ComponentInteraction & Partial<SlotedContext> & {
  ack(): void
  reply(data: InteractionApplicationCommandCallbackData): void
  replyInteractive(data: InteractionApplicationCommandCallbackData): InteractionReplyStateLevelTwo
  replyPrivately(data: InteractionApplicationCommandCallbackData): void
  edit(data: InteractionApplicationCommandCallbackData): void
  editInteractive(data: InteractionApplicationCommandCallbackData): InteractionReplyStateLevelTwo
  // disableComponents(): void
  removeComponents(): void
  state(state?: string, ...args: any): void
}

export type InteractionJanitor = {
  edit(data: InteractionApplicationCommandCallbackData): void
  disableComponents(): void
  removeComponents(): void
  state(state?: string, ...args: any): void
}
