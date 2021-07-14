import { InteractionApplicationCommandCallbackData } from './custom'


export type InteractionCallbackMiddleware = (data?: InteractionApplicationCommandCallbackData, guild?: cordo.GuildData) => any

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
