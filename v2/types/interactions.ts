import { GenericMessageComponent } from "../components/$component"
import { Const } from "./const"
import { InteractionUser, Snowflake } from "./discord"
import { GuildData, UserData } from "./middleware"


export type Interaction<Type extends Const.InteractionType> = {
  type: Type
  data: any

  id: Snowflake
  token: string
  version: number
  user: InteractionUser
  application_id?: Snowflake
  locale?: string
  guild_locale?: string
  guildData?: GuildData
  userData?: UserData

  _answered: boolean
  _httpCallback?: (payload: any) => any
  _answerComponents: GenericMessageComponent[]
}

export type GenericInteraction = Interaction<Const.InteractionType>
