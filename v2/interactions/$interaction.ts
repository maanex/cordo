import { GenericMessageComponent } from "../components/$component"
import { Const } from "../types/const"
import { InteractionMember, InteractionUser, Snowflake } from "../types/discord"
import { GuildData, UserData } from "../types/middleware"
import { AutocompleteInteractionData, AutocompleteInteractionReplyFunctions, parseAutocompleteInteractionData } from "./autocomplete-interaction"
import { CommandInteractionData, CommandInteractionReplyFunctions, parseCommandInteractionData } from "./command-interaction"
import { ComponentInteractionData, ComponentInteractionReplyFunctions, parseComponentInteractionData } from "./component-interaction"
import { ModalSubmitInteractionData, ModalSubmitInteractionReplyFunctions, parseModalSubmitInteractionData } from "./modal-submit-interaction"


export type RawInteraction<Type extends Const.InteractionTypeNames> = {
  // always present
  type: Const.InteractionTypeMapping[Type]
  data: any 
  id: Snowflake
  application_id: Snowflake
  version: number
  token: string

  // optional
  user?: InteractionUser
  member?: InteractionMember
  locale?: string
  guild_locale?: string
  // entitlement_sku_ids?: string[]
  // entitlements?: TODO[]
}

export type RawGenericInteraction = RawInteraction<Const.InteractionTypeNames>

//

type InteractionDataMap = {
  PING: undefined
  COMMAND: CommandInteractionData
  COMPONENT: ComponentInteractionData
  COMMAND_AUTOCOMPLETE: AutocompleteInteractionData
  MODAL_SUBMIT: ModalSubmitInteractionData
}

type InteractionReplyMap = {
  PING: { }
  COMMAND: CommandInteractionReplyFunctions
  COMPONENT: ComponentInteractionReplyFunctions
  COMMAND_AUTOCOMPLETE: AutocompleteInteractionReplyFunctions
  MODAL_SUBMIT: ModalSubmitInteractionReplyFunctions
}

export type ReadonlyInteraction<Type extends Const.InteractionTypeNames> = {
  // always present
  type: Const.InteractionTypeMapping[Type]
  data: InteractionDataMap[Type]
  id: Snowflake
  applicationId: Snowflake
  version: number
  token: string
  user: InteractionUser
  userLocale: string
  guildMember?: InteractionMember
  guildLocale?: string
  
  // custom data
  guildData?: GuildData
  userData?: UserData
  params: Record<string, string>
}

export type Interaction<Type extends Const.InteractionTypeNames> = {
  _answered: boolean
  _httpCallback?: (payload: any) => any
  _answerComponents: GenericMessageComponent[]
} & ReadonlyInteraction<Type> & InteractionReplyMap[Type]

export type GenericInteraction = Interaction<Const.InteractionTypeNames>

//

export function parseInteraction<T extends Const.InteractionTypeNames>(input: RawInteraction<T>): ReadonlyInteraction<T> {
  const dataParsers: Record<Const.InteractionTypeMapping[keyof Const.InteractionTypeMapping], any> = {
    [Const.InteractionType.PING]: null,
    [Const.InteractionType.COMMAND]: parseCommandInteractionData,
    [Const.InteractionType.COMPONENT]: parseComponentInteractionData,
    [Const.InteractionType.COMMAND_AUTOCOMPLETE]: parseAutocompleteInteractionData,
    [Const.InteractionType.MODAL_SUBMIT]: parseModalSubmitInteractionData
  }
  const data = dataParsers[input.type]?.() ?? undefined

  return {
    type: input.type,
    data,
    id: input.id,
    applicationId: input.application_id,
    version: input.version,
    token: input.token,
    user: input.user ?? input.member?.user,
    userLocale: input.locale ?? 'en-US',
    guildMember: input.member,
    guildLocale: input.guild_locale,
    
    guildData: null,
    userData: null,
    params: {}
  }
}
