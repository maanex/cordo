import { AxiosResponse } from 'axios';
import { GenericInteraction } from '..';
import { InteractionApplicationCommandCallbackData } from './custom';
export type CordoConfig = {
    botId: string;
    commandHandlerPath?: string | string[];
    componentHandlerPath?: string | string[];
    uiStatesPath?: string | string[];
    autocompleterPath?: string | string[];
    contextPath?: string | string[];
    botAdmins?: string[] | ((userid: string) => boolean);
    immediateDefer?: (i: GenericInteraction) => boolean;
    texts?: {
        interaction_not_owned_title: string;
        interaction_not_owned_description: string;
        interaction_not_permitted_title: string;
        interaction_not_permitted_description_generic: string;
        interaction_not_permitted_description_bot_admin: string;
        interaction_not_permitted_description_guild_admin: string;
        interaction_not_permitted_description_manage_server: string;
        interaction_not_permitted_description_manage_messages: string;
        interaction_failed: string;
        interaction_invalid_title: string;
        interaction_invalid_description: string;
    };
};
export type InteractionCallbackMiddleware = (data?: InteractionApplicationCommandCallbackData, i?: GenericInteraction) => any;
export type InteractionPreprocessorMiddleware<T extends GenericInteraction> = (i: T) => T | null;
export type GuildDataMiddleware = (guildid: string, i: GenericInteraction) => GuildData | Promise<GuildData>;
export type UserDataMiddleware = (userid: string, i: GenericInteraction) => UserData | Promise<UserData>;
export type ApiResponseHandlerMiddleware = (res: AxiosResponse) => any;
export type CustomLogger = {
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
