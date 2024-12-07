import { InteractionCallbackFollowup, InteractionOpenModalData } from '..';
import { InteractionApplicationCommandCallbackData, InteractionReplyStateLevelTwo } from './custom';
import { InteractionCommandType, ComponentType, ChannelType, InteractionComponentFlag, InteractionType, ApplicationCommandOptionType, EntitlementType, InteractionCallbackType } from './const';
import { GuildData, UserData } from './middleware';
import { MessageComponent } from './component';
export declare type Snowflake = string;
export declare type PermissionBits = string;
export declare type CommandArgumentChoice = {
    name: string;
    value: string;
};
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
export declare type InteractionGuild = {
    id: Snowflake;
    locale: string;
    features: string[];
};
export declare type InteractionChannel = {
    id: Snowflake;
    guild_id?: Snowflake;
    flags: number;
    last_message_id: string;
    past_pin_timestamp: string;
    name: string;
    nsfw: boolean;
    parent_id: string;
    permissions: string;
    position: number;
    rate_limit_per_user: number;
    topic: string;
    type: ChannelType;
};
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
export declare type InteractionTypeCommandOptionsRegular = {
    type: Omit<ApplicationCommandOptionType, ApplicationCommandOptionType.SUB_COMMAND>;
    name: string;
    value: string | number;
    options: undefined;
};
export declare type InteractionTypeCommandOptionsSubCommand = {
    type: ApplicationCommandOptionType.SUB_COMMAND;
    name: string;
    value: undefined;
    options: InteractionTypeCommandOptions[];
};
export declare type InteractionTypeCommandOptions = InteractionTypeCommandOptionsRegular | InteractionTypeCommandOptionsSubCommand;
export declare type Entitlement = {
    application_id: string;
    consumed: boolean;
    deleted: boolean;
    gift_code_flags: number;
    guild_id: string;
    id: string;
    promotion_id: string | null;
    sku_id: string;
    type: EntitlementType;
    user_id: string;
    starts_at?: string;
    ends_at?: string;
};
export declare type InteractionLocationGuild = {
    member: InteractionMember;
    user?: InteractionUser;
    guild: InteractionGuild;
    guild_id: Snowflake;
    channel_id: Snowflake;
};
export declare type InteractionLocationDM = {
    member?: undefined;
    user: InteractionUser;
    guild?: undefined;
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
        options?: InteractionTypeCommandOptions[];
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
export declare type InteractionTypeCommandAutocomplete = {
    type: InteractionType.COMMAND_AUTOCOMPLETE;
    data: {
        id: Snowflake;
        name: string;
        type: InteractionCommandType;
        version: Snowflake;
        options: {
            type: ApplicationCommandOptionType;
            name: string;
            value: string;
            focused: boolean;
        }[];
        input: string;
    };
};
export declare type InteractionTypeModalSubmit = {
    type: InteractionType.MODAL_SUBMIT;
    data: {
        custom_id: string;
        components: MessageComponent[];
        /** parsed components, { [custom_id]: value } */
        data: Record<string, any>;
    };
};
export declare type InteractionBase = {
    id: Snowflake;
    token: string;
    version: number;
    user: InteractionUser;
    application_id?: Snowflake;
    locale?: string;
    guild?: InteractionGuild;
    guild_locale?: string;
    channel: InteractionChannel;
    entitlement_sku_ids?: string[];
    entitlements?: Entitlement[];
    app_permissions: string;
    authorizing_integration_owners: Record<string, string>;
    guildData?: GuildData;
    userData?: UserData;
    _answered: boolean;
    _httpCallback?: (payload: any) => any;
    _answerComponents: MessageComponent[];
};
export declare type GenericInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & (InteractionTypeCommand | InteractionTypeComponent | InteractionTypeCommandAutocomplete | InteractionTypeModalSubmit);
export declare type CommandInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & InteractionTypeCommand;
export declare type ComponentInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & InteractionTypeComponent;
export declare type CommandAutocompleteInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & InteractionTypeCommandAutocomplete;
export declare type ModalSubmitInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & InteractionTypeModalSubmit;
export declare type SlottedContext = {
    params: Record<string, string>;
};
export declare type SlotableInteraction = GenericInteraction & SlottedContext;
export declare type ReplyableCommandInteraction = CommandInteraction & Partial<SlottedContext> & {
    defer(privately?: boolean): Promise<InteractionCallbackFollowup>;
    reply(data: InteractionApplicationCommandCallbackData): Promise<InteractionCallbackFollowup>;
    replyInteractive(data: InteractionApplicationCommandCallbackData): InteractionReplyStateLevelTwo;
    replyPrivately(data: InteractionApplicationCommandCallbackData): void;
    sendRawResponse(type: InteractionCallbackType, data: any): Promise<InteractionCallbackFollowup>;
    openModal(data: InteractionOpenModalData): void;
    state(state?: string, ...args: any): void;
};
export declare type ReplyableComponentInteraction = ComponentInteraction & Partial<SlottedContext> & {
    ack(): void;
    reply(data: InteractionApplicationCommandCallbackData): Promise<InteractionCallbackFollowup>;
    replyInteractive(data: InteractionApplicationCommandCallbackData): InteractionReplyStateLevelTwo;
    replyPrivately(data: InteractionApplicationCommandCallbackData): void;
    edit(data: InteractionApplicationCommandCallbackData): void;
    editInteractive(data: InteractionApplicationCommandCallbackData): InteractionReplyStateLevelTwo;
    sendRawResponse(type: InteractionCallbackType, data: any): Promise<InteractionCallbackFollowup>;
    openModal(data: InteractionOpenModalData): void;
    removeComponents(): void;
    state(state?: string, ...args: any): void;
};
export declare type ReplyableCommandAutocompleteInteraction = CommandAutocompleteInteraction & {
    ack(): void;
    show(choices: CommandArgumentChoice[]): void;
};
export declare type InteractionJanitor = {
    edit(data: InteractionApplicationCommandCallbackData): void;
    disableComponents(): void;
    removeComponents(): void;
    state(state?: string, ...args: any): void;
};
