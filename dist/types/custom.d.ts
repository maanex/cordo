/// <reference types="node" />
import { MessageEmbed } from 'discord.js';
import { GenericInteraction, InteractionJanitor, ReplyableCommandInteraction, ReplyableComponentInteraction } from './base';
import { MessageComponent } from './component';
import { InteractionResponseFlags } from './const';
export declare type LocalisationContext = {
    [key: string]: string;
};
export declare type HandlerSuccess = boolean | Promise<boolean> | any;
export declare type InteractionApplicationCommandCallbackData = {
    tts?: boolean;
    content?: string;
    flags?: InteractionResponseFlags;
    embeds?: Partial<MessageEmbed>[];
    allowed_mentions?: any;
    components?: MessageComponent[];
    description?: string;
    title?: string;
    footer?: string;
    image?: string;
    color?: number;
    _context?: LocalisationContext;
};
export declare type InteractionCommandHandler = ((i: ReplyableCommandInteraction) => HandlerSuccess);
export declare type InteractionComponentHandler = ((i: ReplyableComponentInteraction) => HandlerSuccess);
export declare type InteractionReplyContext = {
    id: string;
    interaction: GenericInteraction;
    timeout: number;
    timeoutRunFunc: (...any: any) => any;
    timeoutRunner: NodeJS.Timeout;
    resetTimeoutOnInteraction: boolean;
    removeTimeoutOnInteraction: boolean;
    handlers: {
        [customId: string]: InteractionComponentHandler;
    };
};
export declare type InteractionReplyStateLevelThree = {
    _context: InteractionReplyContext;
    on(customId: string, handler: InteractionComponentHandler): InteractionReplyStateLevelThree;
};
export declare type InteractionReplyTimeoutOptions = {
    resetTimeoutOnInteraction?: boolean;
    removeTimeoutOnInteraction?: boolean;
};
export declare type InteractionReplyStateLevelTwo = {
    _context: InteractionReplyContext;
    withTimeout(millis: number, janitor: (edit: InteractionJanitor) => any, options?: InteractionReplyTimeoutOptions): InteractionReplyStateLevelThree;
};
export declare type InteractionUIState = (i: GenericInteraction, ...args: any) => InteractionApplicationCommandCallbackData | Promise<InteractionApplicationCommandCallbackData>;
