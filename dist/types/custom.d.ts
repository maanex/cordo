/// <reference types="node" />
import { InteractionMessage } from '..';
import { GenericInteraction, InteractionJanitor, ReplyableCommandInteraction, ReplyableComponentInteraction, MessageEmbed } from './base';
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
    thumbnail?: string;
    color?: number;
    _context?: LocalisationContext;
};
export declare type InteractionCommandHandler = ((i: ReplyableCommandInteraction) => HandlerSuccess);
export declare type InteractionComponentHandler = ((i: ReplyableComponentInteraction) => HandlerSuccess);
export declare type SlottedComponentHandler = {
    regex: RegExp;
    id: string;
    handler: InteractionComponentHandler;
};
export declare type InteractionReplyContext = {
    id: string;
    interaction: GenericInteraction;
    timeout: number;
    timeoutRunFunc: (skipJanitor?: boolean) => any;
    timeoutRunner: NodeJS.Timeout;
    onInteraction: InteractionReplyTimeoutOptions['onInteraction'];
    handlers: {
        [customId: string]: InteractionComponentHandler;
    };
    slottedHandlers: SlottedComponentHandler[];
};
export declare type InteractionReplyStateLevelThree = {
    _context: InteractionReplyContext;
    on(customId: string, handler: InteractionComponentHandler): InteractionReplyStateLevelThree;
    edit(data: InteractionApplicationCommandCallbackData): void;
    followUp(data: InteractionApplicationCommandCallbackData): void;
    triggerJanitor(): void;
};
export declare type InteractionReplyTimeoutOptions = {
    onInteraction?: 'restartTimeout' | 'removeTimeout' | 'triggerTimeout' | 'doNothing';
};
export declare type InteractionReplyStateLevelTwo = {
    _context: InteractionReplyContext;
    withTimeout(millis: number, janitor: (edit: InteractionJanitor) => any, options?: InteractionReplyTimeoutOptions): InteractionReplyStateLevelThree;
};
export declare type InteractionCallbackFollowup = {
    getMessage(): Promise<InteractionMessage>;
    edit(data: InteractionApplicationCommandCallbackData, useRaw?: boolean): void;
};
export declare type InteractionUIState = (i: GenericInteraction, ...args: any) => InteractionApplicationCommandCallbackData | Promise<InteractionApplicationCommandCallbackData>;
