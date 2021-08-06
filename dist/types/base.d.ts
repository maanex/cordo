import { InteractionApplicationCommandCallbackData, InteractionReplyStateLevelTwo } from './custom';
import { ComponentType, InteractionComponentFlag, InteractionType } from './const';
import { GuildData, UserData } from './middleware';
import { MessageComponent } from './component';
export declare type InteractionUser = {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    public_flags: number;
    bot: boolean;
};
export declare type InteractionMember = {
    user: InteractionUser;
    roles: string[];
    premium_since: string | null;
    permissions: string;
    pending: boolean;
    nick: string | null;
    mute: boolean;
    joined_at: string;
    is_pending: boolean;
    deaf: boolean;
};
export declare type InteractionMessage = {
    webhook_id?: string;
    type: number;
    tts: boolean;
    timestamp: string;
    pinned: boolean;
    mentions: any[];
    mention_roles: any[];
    mention_everyone: boolean;
    interaction?: {
        user: InteractionUser;
        type: number;
        name: string;
        id: string;
    };
    id: string;
    flags: number;
    embeds: any[];
    edited_timestamp: string | null;
    content: string;
    components: any;
    channel_id: string;
    author: InteractionUser;
    attachments: any[];
    application_id: string;
};
export declare type InteractionEmoji = {
    id: string;
    name: string;
    animated: boolean;
};
export declare type InteractionLocationGuild = {
    member: InteractionMember;
    user?: InteractionUser;
    guild_id: string;
    channel_id: string;
};
export declare type InteractionLocationDM = {
    member?: undefined;
    user: InteractionUser;
    guild_id?: undefined;
    channel_id?: undefined;
};
export declare type InteractionTypeCommand = {
    type: InteractionType.COMMAND;
    message?: undefined;
    data: {
        id?: string;
        name?: string;
        custom_id?: string;
        options?: {
            name: string;
            value: string | number;
        }[];
        option?: {
            [name: string]: string | number;
        };
    };
};
export declare type InteractionTypeComponent = {
    type: InteractionType.COMPONENT;
    message: InteractionMessage;
    data: {
        commponent_type: ComponentType.BUTTON | ComponentType.SELECT;
        custom_id: string;
        values?: string[];
        flags: InteractionComponentFlag[];
    };
};
export declare type InteractionTypeRichMessage = {
    type: InteractionType.RICH_MESSAGE;
};
export declare type InteractionBase = {
    id: string;
    token: string;
    version: number;
    user: InteractionUser;
    application_id?: string;
    guildData?: GuildData;
    userData?: UserData;
    _answered: boolean;
    _answerComponents: MessageComponent[];
};
export declare type GenericInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & (InteractionTypeCommand | InteractionTypeComponent | InteractionTypeRichMessage);
export declare type CommandInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & InteractionTypeCommand;
export declare type ComponentInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & InteractionTypeComponent;
export declare type RichMessageInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & InteractionTypeRichMessage;
export declare type ReplyableCommandInteraction = CommandInteraction & {
    ack(): void;
    reply(data: InteractionApplicationCommandCallbackData): void;
    replyInteractive(data: InteractionApplicationCommandCallbackData): InteractionReplyStateLevelTwo;
    replyPrivately(data: InteractionApplicationCommandCallbackData): void;
    state(state?: string, ...args: any): void;
};
export declare type ReplyableComponentInteraction = ComponentInteraction & {
    ack(): void;
    reply(data: InteractionApplicationCommandCallbackData): void;
    replyInteractive(data: InteractionApplicationCommandCallbackData): InteractionReplyStateLevelTwo;
    replyPrivately(data: InteractionApplicationCommandCallbackData): void;
    edit(data: InteractionApplicationCommandCallbackData): void;
    editInteractive(data: InteractionApplicationCommandCallbackData): InteractionReplyStateLevelTwo;
    removeComponents(): void;
    state(state?: string, ...args: any): void;
};
export declare type InteractionJanitor = {
    edit(data: InteractionApplicationCommandCallbackData): void;
    disableComponents(): void;
    removeComponents(): void;
    state(state?: string, ...args: any): void;
};
