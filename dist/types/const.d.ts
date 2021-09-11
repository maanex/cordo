export declare enum InteractionCallbackType {
    PONG = 1,
    CHANNEL_MESSAGE_WITH_SOURCE = 4,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
    DEFERRED_UPDATE_MESSAGE = 6,
    UPDATE_MESSAGE = 7
}
export declare enum InteractionResponseFlags {
    EPHEMERAL = 64
}
export declare enum InteractionType {
    /** negative number => custom */
    RICH_MESSAGE = -5,
    COMMAND = 2,
    COMPONENT = 3
}
export declare enum ComponentType {
    /** negative number => custom */
    LINE_BREAK = -5,
    ROW = 1,
    BUTTON = 2,
    SELECT = 3
}
export declare enum InteractionCommandType {
    CHAT_INPUT = 1,
    USER = 2,
    MESSAGE = 3
}
export declare enum ButtonStyle {
    PRIMARY = 1,
    SECONDARY = 2,
    SUCCESS = 3,
    DANGER = 4,
    LINK = 5
}
export declare enum InteractionComponentFlag {
    ACCESS_EVERYONE = "e",
    ACCESS_PRIVATE = "p",
    ACCESS_ADMIN = "a",
    ACCESS_MANAGE_SERVER = "s",
    ACCESS_MANAGE_MESSAGES = "m",
    ACCESS_BOT_ADMIN = "x",
    HIDE_IF_NOT_ALLOWED = "h"
}
export declare enum ChannelType {
    GUILD_TEXT = 0,
    DM = 1,
    GUILD_VOICE = 2,
    GROUP_DM = 3,
    GUILD_CATEGORY = 4,
    GUILD_NEWS = 5,
    GUILD_STORE = 6,
    GUILD_NEWS_THREAD = 10,
    GUILD_PUBLIC_THREAD = 11,
    GUILD_PRIVATE_THREAD = 12,
    GUILD_STAGE_VOICE = 13
}
