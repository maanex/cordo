import { Client, GuildMember, Message, TextChannel } from 'discord.js';
import { InteractionApplicationCommandCallbackData, InteractionCommandHandler, InteractionComponentHandler, InteractionUIState, SlottedComponentHandler } from './types/custom';
import { CordoConfig, CustomLogger, GuildDataMiddleware, InteractionCallbackMiddleware, UserDataMiddleware } from './types/middleware';
import { GenericInteraction, RichMessageInteraction } from './types/base';
export * from './api';
export * from './replies';
export * from './lib/default-logger';
export * from './lib/permission-strings';
export * from './types/base';
export * from './types/component';
export * from './types/const';
export * from './types/custom';
export * from './types/middleware';
export default class Cordo {
    private static commandHandlers;
    private static componentHandlers;
    private static slottedComponentHandlers;
    private static uiStates;
    private static config;
    private static logger;
    private static middlewares;
    static get _data(): {
        config: CordoConfig;
        commandHandlers: {
            [command: string]: InteractionCommandHandler;
        };
        componentHandlers: {
            [command: string]: InteractionComponentHandler;
        };
        slottedComponentHandlers: SlottedComponentHandler[];
        uiStates: {
            [name: string]: InteractionUIState;
        };
        middlewares: {
            interactionCallback: InteractionCallbackMiddleware[];
            fetchGuildData: GuildDataMiddleware;
            fetchUserData: UserDataMiddleware;
        };
        logger: CustomLogger;
        isBotOwner: typeof Cordo.isBotOwner;
    };
    static init(config: CordoConfig): void;
    static registerCommandHandler(command: string, handler: InteractionCommandHandler): void;
    static registerComponentHandler(id: string, handler: InteractionComponentHandler): void;
    static registerUiState(id: string, state: InteractionUIState): void;
    static findCommandHandlers(dir: string | string[], prefix?: string): void;
    static findComponentHandlers(dir: string | string[], prefix?: string): void;
    static findUiStates(dir: string | string[], prefix?: string): void;
    static findContext(dir: string | string[]): void;
    static updateBotId(newId: string): void;
    static updateBotClient(newClient: Client): void;
    static addMiddlewareInteractionCallback(fun: InteractionCallbackMiddleware): void;
    static setMiddlewareGuildData(fun: GuildDataMiddleware): void;
    static setMiddlewareUserData(fun: UserDataMiddleware): void;
    static emitInteraction(i: GenericInteraction): Promise<void>;
    static sendRichReply(replyTo: Message, data: InteractionApplicationCommandCallbackData, mentionUser?: boolean): RichMessageInteraction;
    static sendRichMessage(channel: TextChannel, member: GuildMember, data: InteractionApplicationCommandCallbackData, replyTo?: Message, mentionUser?: boolean): RichMessageInteraction;
    private static getRichMessageInteraction;
    private static onCommand;
    private static componentPermissionCheck;
    private static onComponent;
    private static interactionNotPermitted;
    private static interactionNotOwned;
    private static isBotOwner;
}
