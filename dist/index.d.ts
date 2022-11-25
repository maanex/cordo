import { Request, Response } from "express";
import { CordoConfig, CustomLogger, GuildDataMiddleware, InteractionCallbackMiddleware, UserDataMiddleware, ApiResponseHandlerMiddleware } from './types/middleware';
import { GenericInteraction } from './types/base';
import { InteractionCommandAutocompleteHandler, InteractionCommandHandler, InteractionComponentHandler, InteractionUIState } from "./types/custom";
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
    private static __data;
    static get _data(): {
        config: CordoConfig;
        commandHandlers: Map<string, InteractionCommandHandler>;
        componentHandlers: Map<string, InteractionComponentHandler>;
        slottedComponentHandlers: Set<import("./types/custom").SlottedComponentHandler>;
        uiStates: Map<string, InteractionUIState>;
        slottedUiStates: Set<import("./types/custom").SlottedUIState>;
        middlewares: {
            interactionCallback: InteractionCallbackMiddleware[];
            fetchGuildData: GuildDataMiddleware;
            fetchUserData: UserDataMiddleware;
            apiResponseHandler: ApiResponseHandlerMiddleware;
        };
        logger: CustomLogger;
    };
    static init(config: CordoConfig): void;
    static findContext(dir: string | string[]): void;
    static updateBotId(newId: string): void;
    static findCommandHandlers(dir: string | string[], prefix?: string): void;
    static registerCommandHandler(command: string, handler: InteractionCommandHandler): void;
    static findComponentHandlers(dir: string | string[], prefix?: string): void;
    static registerComponentHandler(id: string, handler: InteractionComponentHandler): void;
    static findUiStates(dir: string | string[], prefix?: string): void;
    static registerUiState(id: string, state: InteractionUIState): void;
    static findAutocompleteHandlers(dir: string | string[], prefix?: string): void;
    static registerAutocompleteHandler(id: string, handler: InteractionCommandAutocompleteHandler): void;
    static addMiddlewareInteractionCallback(fun: InteractionCallbackMiddleware): void;
    static setMiddlewareGuildData(fun: GuildDataMiddleware): void;
    static setMiddlewareUserData(fun: UserDataMiddleware): void;
    static setMiddlewareApiResponseHandler(fun: ApiResponseHandlerMiddleware): void;
    static emitInteraction(i: GenericInteraction): Promise<void>;
    static useWithExpress(clientPublicKey: string): (req: Request, res: Response) => void;
}
