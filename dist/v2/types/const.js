"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Const = void 0;
var Const;
(function (Const) {
    let InteractionCallbackType;
    (function (InteractionCallbackType) {
        InteractionCallbackType[InteractionCallbackType["PONG"] = 1] = "PONG";
        InteractionCallbackType[InteractionCallbackType["CHANNEL_MESSAGE_WITH_SOURCE"] = 4] = "CHANNEL_MESSAGE_WITH_SOURCE";
        InteractionCallbackType[InteractionCallbackType["DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE"] = 5] = "DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE";
        InteractionCallbackType[InteractionCallbackType["DEFERRED_UPDATE_MESSAGE"] = 6] = "DEFERRED_UPDATE_MESSAGE";
        InteractionCallbackType[InteractionCallbackType["UPDATE_MESSAGE"] = 7] = "UPDATE_MESSAGE";
        InteractionCallbackType[InteractionCallbackType["APPLICATION_COMMAND_AUTOCOMPLETE_RESULT"] = 8] = "APPLICATION_COMMAND_AUTOCOMPLETE_RESULT";
        InteractionCallbackType[InteractionCallbackType["MODAL"] = 9] = "MODAL";
    })(InteractionCallbackType = Const.InteractionCallbackType || (Const.InteractionCallbackType = {}));
    let InteractionResponseFlags;
    (function (InteractionResponseFlags) {
        InteractionResponseFlags[InteractionResponseFlags["EPHEMERAL"] = 64] = "EPHEMERAL";
    })(InteractionResponseFlags = Const.InteractionResponseFlags || (Const.InteractionResponseFlags = {}));
    Const.InteractionType = {
        PING: 1,
        COMMAND: 2,
        COMPONENT: 3,
        COMMAND_AUTOCOMPLETE: 4,
        MODAL_SUBMIT: 5
    };
    let ComponentType;
    (function (ComponentType) {
        /** negative number => custom */
        ComponentType[ComponentType["LINE_BREAK"] = -5] = "LINE_BREAK";
        ComponentType[ComponentType["ROW"] = 1] = "ROW";
        ComponentType[ComponentType["BUTTON"] = 2] = "BUTTON";
        ComponentType[ComponentType["SELECT"] = 3] = "SELECT";
        ComponentType[ComponentType["TEXT"] = 4] = "TEXT";
    })(ComponentType = Const.ComponentType || (Const.ComponentType = {}));
    let InteractionCommandType;
    (function (InteractionCommandType) {
        InteractionCommandType[InteractionCommandType["CHAT_INPUT"] = 1] = "CHAT_INPUT";
        InteractionCommandType[InteractionCommandType["USER"] = 2] = "USER";
        InteractionCommandType[InteractionCommandType["MESSAGE"] = 3] = "MESSAGE";
    })(InteractionCommandType = Const.InteractionCommandType || (Const.InteractionCommandType = {}));
    let ButtonStyle;
    (function (ButtonStyle) {
        ButtonStyle[ButtonStyle["PRIMARY"] = 1] = "PRIMARY";
        ButtonStyle[ButtonStyle["SECONDARY"] = 2] = "SECONDARY";
        ButtonStyle[ButtonStyle["SUCCESS"] = 3] = "SUCCESS";
        ButtonStyle[ButtonStyle["DANGER"] = 4] = "DANGER";
        ButtonStyle[ButtonStyle["LINK"] = 5] = "LINK";
    })(ButtonStyle = Const.ButtonStyle || (Const.ButtonStyle = {}));
    let TextInputStyle;
    (function (TextInputStyle) {
        TextInputStyle[TextInputStyle["SHORT"] = 1] = "SHORT";
        TextInputStyle[TextInputStyle["PARAGRAPH"] = 2] = "PARAGRAPH";
    })(TextInputStyle = Const.TextInputStyle || (Const.TextInputStyle = {}));
    let InteractionComponentFlag;
    (function (InteractionComponentFlag) {
        InteractionComponentFlag["ACCESS_EVERYONE"] = "e";
        InteractionComponentFlag["ACCESS_PRIVATE"] = "p";
        InteractionComponentFlag["ACCESS_ADMIN"] = "a";
        InteractionComponentFlag["ACCESS_MANAGE_SERVER"] = "s";
        InteractionComponentFlag["ACCESS_MANAGE_MESSAGES"] = "m";
        InteractionComponentFlag["ACCESS_BOT_ADMIN"] = "x";
        InteractionComponentFlag["HIDE_IF_NOT_ALLOWED"] = "h";
    })(InteractionComponentFlag = Const.InteractionComponentFlag || (Const.InteractionComponentFlag = {}));
    let ChannelType;
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
    })(ChannelType = Const.ChannelType || (Const.ChannelType = {}));
    let ApplicationCommandOptionType;
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
    })(ApplicationCommandOptionType = Const.ApplicationCommandOptionType || (Const.ApplicationCommandOptionType = {}));
})(Const = exports.Const || (exports.Const = {}));
//# sourceMappingURL=const.js.map