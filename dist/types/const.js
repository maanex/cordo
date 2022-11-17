"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationCommandOptionType = exports.ChannelType = exports.InteractionComponentFlag = exports.TextInputStyle = exports.ButtonStyle = exports.InteractionCommandType = exports.ComponentType = exports.InteractionType = exports.InteractionResponseFlags = exports.InteractionCallbackType = void 0;
var InteractionCallbackType;
(function (InteractionCallbackType) {
    InteractionCallbackType[InteractionCallbackType["PONG"] = 1] = "PONG";
    InteractionCallbackType[InteractionCallbackType["CHANNEL_MESSAGE_WITH_SOURCE"] = 4] = "CHANNEL_MESSAGE_WITH_SOURCE";
    InteractionCallbackType[InteractionCallbackType["DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE"] = 5] = "DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE";
    InteractionCallbackType[InteractionCallbackType["DEFERRED_UPDATE_MESSAGE"] = 6] = "DEFERRED_UPDATE_MESSAGE";
    InteractionCallbackType[InteractionCallbackType["UPDATE_MESSAGE"] = 7] = "UPDATE_MESSAGE";
    InteractionCallbackType[InteractionCallbackType["APPLICATION_COMMAND_AUTOCOMPLETE_RESULT"] = 8] = "APPLICATION_COMMAND_AUTOCOMPLETE_RESULT";
    InteractionCallbackType[InteractionCallbackType["MODAL"] = 9] = "MODAL";
})(InteractionCallbackType = exports.InteractionCallbackType || (exports.InteractionCallbackType = {}));
var InteractionResponseFlags;
(function (InteractionResponseFlags) {
    InteractionResponseFlags[InteractionResponseFlags["EPHEMERAL"] = 64] = "EPHEMERAL";
})(InteractionResponseFlags = exports.InteractionResponseFlags || (exports.InteractionResponseFlags = {}));
var InteractionType;
(function (InteractionType) {
    InteractionType[InteractionType["PING"] = 1] = "PING";
    InteractionType[InteractionType["COMMAND"] = 2] = "COMMAND";
    InteractionType[InteractionType["COMPONENT"] = 3] = "COMPONENT";
    InteractionType[InteractionType["COMMAND_AUTOCOMPLETE"] = 4] = "COMMAND_AUTOCOMPLETE";
    InteractionType[InteractionType["MODAL_SUBMIT"] = 5] = "MODAL_SUBMIT";
})(InteractionType = exports.InteractionType || (exports.InteractionType = {}));
var ComponentType;
(function (ComponentType) {
    /** negative number => custom */
    ComponentType[ComponentType["LINE_BREAK"] = -5] = "LINE_BREAK";
    ComponentType[ComponentType["ROW"] = 1] = "ROW";
    ComponentType[ComponentType["BUTTON"] = 2] = "BUTTON";
    ComponentType[ComponentType["SELECT"] = 3] = "SELECT";
    ComponentType[ComponentType["TEXT"] = 4] = "TEXT";
    ComponentType[ComponentType["USER_SELECT"] = 5] = "USER_SELECT";
    ComponentType[ComponentType["ROLE_SELECT"] = 6] = "ROLE_SELECT";
    ComponentType[ComponentType["MENTIONABLE_SELECT"] = 7] = "MENTIONABLE_SELECT";
    ComponentType[ComponentType["CHANNEL_SELECT"] = 8] = "CHANNEL_SELECT";
})(ComponentType = exports.ComponentType || (exports.ComponentType = {}));
var InteractionCommandType;
(function (InteractionCommandType) {
    InteractionCommandType[InteractionCommandType["CHAT_INPUT"] = 1] = "CHAT_INPUT";
    InteractionCommandType[InteractionCommandType["USER"] = 2] = "USER";
    InteractionCommandType[InteractionCommandType["MESSAGE"] = 3] = "MESSAGE";
})(InteractionCommandType = exports.InteractionCommandType || (exports.InteractionCommandType = {}));
var ButtonStyle;
(function (ButtonStyle) {
    ButtonStyle[ButtonStyle["PRIMARY"] = 1] = "PRIMARY";
    ButtonStyle[ButtonStyle["SECONDARY"] = 2] = "SECONDARY";
    ButtonStyle[ButtonStyle["SUCCESS"] = 3] = "SUCCESS";
    ButtonStyle[ButtonStyle["DANGER"] = 4] = "DANGER";
    ButtonStyle[ButtonStyle["LINK"] = 5] = "LINK";
})(ButtonStyle = exports.ButtonStyle || (exports.ButtonStyle = {}));
var TextInputStyle;
(function (TextInputStyle) {
    TextInputStyle[TextInputStyle["SHORT"] = 1] = "SHORT";
    TextInputStyle[TextInputStyle["PARAGRAPH"] = 2] = "PARAGRAPH";
})(TextInputStyle = exports.TextInputStyle || (exports.TextInputStyle = {}));
var InteractionComponentFlag;
(function (InteractionComponentFlag) {
    InteractionComponentFlag["ACCESS_EVERYONE"] = "e";
    InteractionComponentFlag["ACCESS_PRIVATE"] = "p";
    InteractionComponentFlag["ACCESS_ADMIN"] = "a";
    InteractionComponentFlag["ACCESS_MANAGE_SERVER"] = "s";
    InteractionComponentFlag["ACCESS_MANAGE_MESSAGES"] = "m";
    InteractionComponentFlag["ACCESS_BOT_ADMIN"] = "x";
    InteractionComponentFlag["HIDE_IF_NOT_ALLOWED"] = "h";
})(InteractionComponentFlag = exports.InteractionComponentFlag || (exports.InteractionComponentFlag = {}));
var ChannelType;
(function (ChannelType) {
    ChannelType[ChannelType["GUILD_TEXT"] = 0] = "GUILD_TEXT";
    ChannelType[ChannelType["DM"] = 1] = "DM";
    ChannelType[ChannelType["GUILD_VOICE"] = 2] = "GUILD_VOICE";
    ChannelType[ChannelType["GROUP_DM"] = 3] = "GROUP_DM";
    ChannelType[ChannelType["GUILD_CATEGORY"] = 4] = "GUILD_CATEGORY";
    ChannelType[ChannelType["GUILD_NEWS"] = 5] = "GUILD_NEWS";
    ChannelType[ChannelType["GUILD_STORE"] = 6] = "GUILD_STORE";
    ChannelType[ChannelType["GUILD_NEWS_THREAD"] = 10] = "GUILD_NEWS_THREAD";
    ChannelType[ChannelType["GUILD_PUBLIC_THREAD"] = 11] = "GUILD_PUBLIC_THREAD";
    ChannelType[ChannelType["GUILD_PRIVATE_THREAD"] = 12] = "GUILD_PRIVATE_THREAD";
    ChannelType[ChannelType["GUILD_STAGE_VOICE"] = 13] = "GUILD_STAGE_VOICE";
    ChannelType[ChannelType["GUILD_DIRECTORY"] = 14] = "GUILD_DIRECTORY";
    ChannelType[ChannelType["GUILD_FORUM"] = 15] = "GUILD_FORUM";
})(ChannelType = exports.ChannelType || (exports.ChannelType = {}));
var ApplicationCommandOptionType;
(function (ApplicationCommandOptionType) {
    ApplicationCommandOptionType[ApplicationCommandOptionType["SUB_COMMAND"] = 1] = "SUB_COMMAND";
    ApplicationCommandOptionType[ApplicationCommandOptionType["SUB_COMMAND_GROUP"] = 2] = "SUB_COMMAND_GROUP";
    ApplicationCommandOptionType[ApplicationCommandOptionType["STRING"] = 3] = "STRING";
    ApplicationCommandOptionType[ApplicationCommandOptionType["INTEGER"] = 4] = "INTEGER";
    ApplicationCommandOptionType[ApplicationCommandOptionType["BOOLEAN"] = 5] = "BOOLEAN";
    ApplicationCommandOptionType[ApplicationCommandOptionType["USER"] = 6] = "USER";
    ApplicationCommandOptionType[ApplicationCommandOptionType["CHANNEL"] = 7] = "CHANNEL";
    ApplicationCommandOptionType[ApplicationCommandOptionType["ROLE"] = 8] = "ROLE";
    ApplicationCommandOptionType[ApplicationCommandOptionType["MENTIONABLE"] = 9] = "MENTIONABLE";
    ApplicationCommandOptionType[ApplicationCommandOptionType["NUMBER"] = 10] = "NUMBER";
    ApplicationCommandOptionType[ApplicationCommandOptionType["ATTACHMENT"] = 11] = "ATTACHMENT";
})(ApplicationCommandOptionType = exports.ApplicationCommandOptionType || (exports.ApplicationCommandOptionType = {}));
//# sourceMappingURL=const.js.map