/// <reference types="node" />
import { InteractionMessage } from '..';
import { GenericInteraction, InteractionJanitor, ReplyableCommandInteraction, ReplyableComponentInteraction, MessageEmbed, ReplyableCommandAutocompleteInteraction, CommandArgumentChoice, SlotedContext } from './base';
import { MessageComponent } from './component';
import { InteractionResponseFlags } from './const';
export type LocalisationContext = {
    [key: string]: string;
};
export type HandlerSuccess = boolean | Promise<boolean> | any;
export type InteractionDefferedCallbackData = {
    flags?: InteractionResponseFlags;
};
export type InteractionApplicationCommandCallbackData = {
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
export type InteractionApplicationCommandAutocompleteCallbackData = {
    choices: CommandArgumentChoice[];
};
export type InteractionOpenModalData = {
    custom_id: string;
    title: string;
    components: MessageComponent[];
};
export type InteractionCommandHandler = ((i: ReplyableCommandInteraction) => HandlerSuccess);
export type InteractionComponentHandler = ((i: ReplyableComponentInteraction) => HandlerSuccess);
export type InteractionCommandAutocompleteHandler = ((i: ReplyableCommandAutocompleteInteraction) => HandlerSuccess);
export type SlottedCommandHandler = {
    regex: RegExp;
    command: string;
    handler: InteractionCommandHandler;
};
export type SlottedComponentHandler = {
    regex: RegExp;
    id: string;
    handler: InteractionComponentHandler;
};
export type InteractionReplyContext = {
    id: string;
    interaction: GenericInteraction;
    timeout: number;
    timeoutRunFunc: (skipJanitor?: boolean) => any;
    timeoutRunner: NodeJS.Timeout;
    onInteraction: InteractionReplyTimeoutOptions['onInteraction'];
    handlers: Map<string, InteractionComponentHandler>;
    slottedHandlers: Set<SlottedComponentHandler>;
};
export type InteractionReplyStateLevelThree = {
    _context: InteractionReplyContext;
    on(customId: string, handler: InteractionComponentHandler): InteractionReplyStateLevelThree;
    edit(data: InteractionApplicationCommandCallbackData): void;
    followUp(data: InteractionApplicationCommandCallbackData): void;
    triggerJanitor(): void;
};
export type InteractionReplyTimeoutOptions = {
    onInteraction?: 'restartTimeout' | 'removeTimeout' | 'triggerTimeout' | 'doNothing';
};
export type InteractionReplyStateLevelTwo = {
    _context: InteractionReplyContext;
    withTimeout(millis: number, janitor: (edit: InteractionJanitor) => any, options?: InteractionReplyTimeoutOptions): InteractionReplyStateLevelThree;
};
export type InteractionCallbackFollowup = {
    getMessage(): Promise<InteractionMessage>;
    edit(data: InteractionApplicationCommandCallbackData, useRaw?: boolean): void;
};
export type InteractionUIState = (i: GenericInteraction & Partial<SlotedContext>, ...args: any) => InteractionApplicationCommandCallbackData | Promise<InteractionApplicationCommandCallbackData>;
export type SlottedUIState = {
    regex: RegExp;
    id: string;
    state: InteractionUIState;
};
