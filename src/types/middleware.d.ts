import { InteractionApplicationCommandCallbackData } from './custom'


export type CordoConfig = {
  botId: string
  commandHandlerPath?: string | string[]
  componentHandlerPath?: string | string[]
  uiStatesPath?: string | string[]
  contextPath?: string | string[]
  botAdmins: string[] | ((userid: string) => boolean)
}

export type InteractionCallbackMiddleware = (data?: InteractionApplicationCommandCallbackData, guild?: cordo.GuildData) => any
export type GuildDataMiddleware = (guildid: string) => cordo.GuildData | Promise<cordo.GuildData>
export type UserDataMiddleware = (userid: string) => cordo.UserData | Promise<cordo.UserData>

export type CustomLogger = {
  log(content: any): any
  warn(content: any): any
  error(content: any): any
  info(content: any): any
  debug(content: any): any
}


export namespace cordo {
  export type GuildData = { }
  export type UserData = { }
}
