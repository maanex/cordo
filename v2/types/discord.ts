import { Const } from './const'


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
  type: Const.ChannelType
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
