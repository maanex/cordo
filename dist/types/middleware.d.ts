import { InteractionApplicationCommandCallbackData } from './custom';
export declare type CordoConfig = {
    botId: string;
    commandHandlerPath?: string | string[];
    componentHandlerPath?: string | string[];
    uiStatesPath?: string | string[];
    contextPath?: string | string[];
    botAdmins?: string[] | ((userid: string) => boolean);
    texts: {
        interaction_not_owned_title: string;
        interaction_not_owned_description: string;
        interaction_not_permitted_title: string;
        interaction_not_permitted_description_generic: string;
        interaction_not_permitted_description_bot_admin: string;
        interaction_not_permitted_description_guild_admin: string;
        interaction_not_permitted_description_manage_server: string;
        interaction_not_permitted_description_manage_messages: string;
        interaction_failed: string;
    };
};
export declare type InteractionCallbackMiddleware = (data?: InteractionApplicationCommandCallbackData, guild?: GuildData) => any;
export declare type GuildDataMiddleware = (guildid: string) => GuildData | Promise<GuildData>;
export declare type UserDataMiddleware = (userid: string) => UserData | Promise<UserData>;
export declare type CustomLogger = {
    log(content: any): any;
    warn(content: any): any;
    error(content: any): any;
    info(content: any): any;
    debug(content: any): any;
};
export interface GuildData {
}
export interface UserData {
}
