export declare enum InteractionCallbackType {
    PONG = 1,
    CHANNEL_MESSAGE_WITH_SOURCE = 4,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
    DEFERRED_UPDATE_MESSAGE = 6,
    UPDATE_MESSAGE = 7,
    APPLICATION_COMMAND_AUTOCOMPLETE_RESULT = 8,
    MODAL = 9
}
export declare enum InteractionResponseFlags {
    EPHEMERAL = 64
}
export declare enum InteractionType {
    PING = 1,
    COMMAND = 2,
    COMPONENT = 3,
    COMMAND_AUTOCOMPLETE = 4,
    MODAL_SUBMIT = 5
}
export declare enum ComponentType {
    /** negative number => custom */
    LINE_BREAK = -5,
    ROW = 1,
    BUTTON = 2,
    SELECT = 3,
    TEXT = 4,
    USER_SELECT = 5,
    ROLE_SELECT = 6,
    MENTIONABLE_SELECT = 7,
    CHANNEL_SELECT = 8
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
export declare enum TextInputStyle {
    SHORT = 1,
    PARAGRAPH = 2
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
    GUILD_STAGE_VOICE = 13,
    GUILD_DIRECTORY = 14,
    GUILD_FORUM = 15
}
export declare enum ApplicationCommandOptionType {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP = 2,
    STRING = 3,
    INTEGER = 4,
    BOOLEAN = 5,
    USER = 6,
    CHANNEL = 7,
    ROLE = 8,
    MENTIONABLE = 9,
    NUMBER = 10,
    ATTACHMENT = 11
}
