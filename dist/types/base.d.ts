import { InteractionCallbackFollowup } from '..';
import { InteractionApplicationCommandCallbackData, InteractionReplyStateLevelTwo } from './custom';
import { InteractionCommandType, ComponentType, ChannelType, InteractionComponentFlag, InteractionType } from './const';
import { GuildData, UserData } from './middleware';
import { MessageComponent } from './component';
export declare type Snowflake = string;
export declare type PermissionBits = string;
export declare type InteractionUser = {
    id: Snowflake;
    username: string;
    avatar: string;
    discriminator: string;
    public_flags: number;
    bot: boolean;
};
export declare type InteractionMember = {
    user: InteractionUser;
    roles: Snowflake[];
    premium_since: string | null;
    permissions: PermissionBits;
    pending: boolean;
    nick: string | null;
    mute: boolean;
    joined_at: string;
    is_pending: boolean;
    deaf: boolean;
};
export declare type PartialInteractionMember = Omit<InteractionMember, 'user' | 'mute' | 'deaf'>;
export declare type PartialInteractionChannel = {
    id: Snowflake;
    name: string;
    type: ChannelType;
    permissions: Snowflake;
};
export declare type InteractionMessageAttachment = {
    id: Snowflake;
    filename: string;
    content_type?: string;
    size: number;
    url: string;
    proxy_url: string;
    height?: number;
    width?: number;
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
    id: Snowflake;
    flags: number;
    embeds: any[];
    edited_timestamp: string | null;
    content: string;
    components: any;
    channel_id: string;
    author: InteractionUser;
    attachments: InteractionMessageAttachment[];
    application_id: string;
};
export declare type PartialInteractionMessage = InteractionMessage;
export declare type MessageEmbed = {
    title?: string;
    type?: 'rich' | 'image' | 'video' | 'gifv' | 'article' | 'link';
    description?: string;
    url?: string;
    timestamp?: number;
    color?: number;
    footer?: {
        text: string;
        icon_url?: string;
        proxy_icon_url?: string;
    };
    image?: {
        url: string;
        proxy_url?: string;
        height?: number;
        width?: number;
    };
    thumbnail?: {
        url: string;
        proxy_url?: string;
        height?: number;
        width?: number;
    };
    video?: {
        url: string;
        proxy_url?: string;
        height?: number;
        width?: number;
    };
    provider?: {
        name?: string;
        url?: string;
    };
    author?: {
        name: string;
        url?: string;
        icon_url?: string;
        proxy_icon_url?: string;
    };
    fields?: {
        name: string;
        value: string;
        inline?: boolean;
    }[];
};
export declare type InteractionEmoji = {
    id: Snowflake;
    name: string;
    animated: boolean;
};
export declare type InteractionRole = {
    id: Snowflake;
    name: string;
    color: number;
    hoist: boolean;
    position: number;
    permissions: PermissionBits;
    managed: boolean;
    mentionable: boolean;
    tags?: {
        bot_id?: Snowflake;
        integration_id?: Snowflake;
        premium_subscriber?: null;
    };
};
export declare type InteractionResolvedData = {
    users?: Record<Snowflake, InteractionUser>;
    members?: Record<Snowflake, PartialInteractionMember>;
    roles?: Record<Snowflake, InteractionRole>;
    channels?: Record<Snowflake, PartialInteractionChannel>;
    messages?: Record<Snowflake, PartialInteractionMessage>;
};
export declare type InteractionLocationGuild = {
    member: InteractionMember;
    user?: InteractionUser;
    guild_id: Snowflake;
    channel_id: Snowflake;
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
        id: Snowflake;
        name: string;
        resolved: InteractionResolvedData;
        options?: {
            name: string;
            value: string | number;
        }[];
        option?: {
            [name: string]: string | number;
        };
    } & ({
        type: InteractionCommandType.CHAT_INPUT;
    } | {
        type: InteractionCommandType.USER;
        target_id: Snowflake;
        target: InteractionUser;
    } | {
        type: InteractionCommandType.MESSAGE;
        target_id: Snowflake;
        target: InteractionMessage;
    });
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
    id: Snowflake;
    token: string;
    version: number;
    user: InteractionUser;
    application_id?: Snowflake;
    guildData?: GuildData;
    userData?: UserData;
    _answered: boolean;
    _answerComponents: MessageComponent[];
};
export declare type GenericInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & (InteractionTypeCommand | InteractionTypeComponent | InteractionTypeRichMessage);
export declare type CommandInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & InteractionTypeCommand;
export declare type ComponentInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & InteractionTypeComponent;
export declare type RichMessageInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & InteractionTypeRichMessage;
export declare type SlotedContext = {
    params: Record<string, string>;
};
export declare type ReplyableCommandInteraction = CommandInteraction & {
    defer(privately?: boolean): Promise<InteractionCallbackFollowup>;
    reply(data: InteractionApplicationCommandCallbackData): Promise<InteractionCallbackFollowup>;
    replyInteractive(data: InteractionApplicationCommandCallbackData): InteractionReplyStateLevelTwo;
    replyPrivately(data: InteractionApplicationCommandCallbackData): void;
    state(state?: string, ...args: any): void;
};
export declare type ReplyableComponentInteraction = ComponentInteraction & Partial<SlotedContext> & {
    ack(): void;
    reply(data: InteractionApplicationCommandCallbackData): Promise<InteractionCallbackFollowup>;
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
