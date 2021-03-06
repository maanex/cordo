/* eslint-disable camelcase */

import { InteractionEmoji } from './base'
import { ButtonStyle, ComponentType, InteractionComponentFlag, TextInputStyle } from './const'


// Button

export type MessageComponentButton = {
  type: ComponentType.BUTTON
  visible?: boolean
  label?: string
  emoji?: Partial<InteractionEmoji>
  disabled?: boolean
  flags?: InteractionComponentFlag[]
} & ({
  style: ButtonStyle.PRIMARY | ButtonStyle.SECONDARY | ButtonStyle.SUCCESS | ButtonStyle.DANGER
  custom_id: string
} | {
  style: ButtonStyle.LINK
  url: string
})

// Selects

export type MessageComponentSelectOption = {
  label: string
  value: string
  description?: string
  emoji?: Partial<InteractionEmoji>
  default?: boolean
}

export type MessageComponentSelectMenu = {
  type: ComponentType.SELECT
  visible?: boolean
  custom_id: string
  options: MessageComponentSelectOption[]
  placeholder?: string
  min_values?: number
  max_values?: number
  disabled?: boolean
  flags?: InteractionComponentFlag[]
}

export type MessageComponentTextInput = {
  type: ComponentType.TEXT
  visible?: boolean
  custom_id: string
  style: TextInputStyle
  label: string
  min_length?: number
  max_length?: number
  required?: boolean
  value?: string
  placeholder?: string
}

// Custom

export type LineBreak = {
  type: ComponentType.LINE_BREAK
  visible?: boolean
}

// Generic

export type MessageComponent = MessageComponentButton | MessageComponentSelectMenu | LineBreak | MessageComponentTextInput

// Action Row

export type ActionRow = {
  type: ComponentType.ROW
  components: MessageComponent[]
}
