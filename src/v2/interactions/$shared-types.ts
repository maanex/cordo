import { LocalisationContext } from "../.."
import { MessageComponent } from "../components/$component"
import { Const } from "../types/const"
import { MessageEmbed } from "../types/discord"
import { ListOmit } from "../types/helper"
import { GenericInteraction, Interaction } from "./$interaction"


export type TextBasedInteractionCallbackData<CustomIds extends string> = {
  tts?: boolean
  content?: string
  flags?: Const.InteractionResponseFlags
  embeds?: Partial<MessageEmbed>[]
  allowedMentions?: any
  components?: MessageComponent<any, CustomIds>[]

  description?: string
  title?: string
  footer?: string
  image?: string
  thumbnail?: string
  color?: number

  context?: LocalisationContext
}

export type CommandOption = {
  name: string
  type: Const.ApplicationCommandOptionType
  value?: string | number
  options?: CommandOption[]
  focused?: boolean
}

//

export namespace InteractionReplies {

  export type Context = {
    id: string
    interaction: GenericInteraction
    timeout: number
    timeoutRunFunc: (skipJanitor?: boolean) => any
    timeoutRunner: NodeJS.Timeout
    onInteraction: TimeoutOptions['onInteraction']
    handlers: Map<string, Handlers.InteractionHandler<'COMPONENT'>>
    slottedHandlers: Set<Handlers.SlottedInteractionHandler<'COMPONENT'>>
  }

  export type LevelTwoState<CustomIds extends string> = {
    _context: Context
    withTimeout(millis: number, janitor?: (edit: InteractionJanitor) => any, options?: TimeoutOptions): LevelThreeState<CustomIds>
  }

  export type LevelThreeState<CustomIds extends string> = {
    _context: Context
    on<Id extends CustomIds>(customId: Id | `$${string}` | `${string}$${string}`, handler: Handlers.InteractionHandler<'COMPONENT'>): LevelThreeState<ListOmit<CustomIds, Id>>
    edit(data: TextBasedInteractionCallbackData<string>): void
    followUp(data: TextBasedInteractionCallbackData<string>): void
    triggerJanitor(): void
  }

  export type TimeoutOptions = {
    onInteraction?: 'restartTimeout' | 'removeTimeout' | 'triggerTimeout' | 'doNothing'
  }

  export type InteractionJanitor = {
    edit(data: TextBasedInteractionCallbackData<string>): void
    disableComponents(): void
    removeComponents(): void
    state(state?: string, ...args: any): void
  }

}

//

export namespace Handlers {

  export type InteractionHandler<Type extends Const.InteractionTypeNames> = (i: Interaction<Type>) => void

  export type SlottedInteractionHandler<Type extends Const.InteractionTypeNames> = {
    regex: RegExp
    id: string
    handler: InteractionHandler<Type>
  }

}
