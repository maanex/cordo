"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionComponentFlag = exports.ButtonStyle = exports.ComponentType = exports.InteractionType = exports.InteractionResponseFlags = exports.InteractionCallbackType = void 0;
var InteractionCallbackType;
(function (InteractionCallbackType) {
    InteractionCallbackType[InteractionCallbackType["PONG"] = 1] = "PONG";
    InteractionCallbackType[InteractionCallbackType["CHANNEL_MESSAGE_WITH_SOURCE"] = 4] = "CHANNEL_MESSAGE_WITH_SOURCE";
    InteractionCallbackType[InteractionCallbackType["DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE"] = 5] = "DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE";
    InteractionCallbackType[InteractionCallbackType["DEFERRED_UPDATE_MESSAGE"] = 6] = "DEFERRED_UPDATE_MESSAGE";
    InteractionCallbackType[InteractionCallbackType["UPDATE_MESSAGE"] = 7] = "UPDATE_MESSAGE";
})(InteractionCallbackType = exports.InteractionCallbackType || (exports.InteractionCallbackType = {}));
var InteractionResponseFlags;
(function (InteractionResponseFlags) {
    InteractionResponseFlags[InteractionResponseFlags["EPHEMERAL"] = 64] = "EPHEMERAL";
})(InteractionResponseFlags = exports.InteractionResponseFlags || (exports.InteractionResponseFlags = {}));
var InteractionType;
(function (InteractionType) {
    /** negative number => custom */
    InteractionType[InteractionType["RICH_MESSAGE"] = -5] = "RICH_MESSAGE";
    InteractionType[InteractionType["COMMAND"] = 2] = "COMMAND";
    InteractionType[InteractionType["COMPONENT"] = 3] = "COMPONENT";
})(InteractionType = exports.InteractionType || (exports.InteractionType = {}));
var ComponentType;
(function (ComponentType) {
    /** negative number => custom */
    ComponentType[ComponentType["LINE_BREAK"] = -5] = "LINE_BREAK";
    ComponentType[ComponentType["ROW"] = 1] = "ROW";
    ComponentType[ComponentType["BUTTON"] = 2] = "BUTTON";
    ComponentType[ComponentType["SELECT"] = 3] = "SELECT";
})(ComponentType = exports.ComponentType || (exports.ComponentType = {}));
var ButtonStyle;
(function (ButtonStyle) {
    ButtonStyle[ButtonStyle["PRIMARY"] = 1] = "PRIMARY";
    ButtonStyle[ButtonStyle["SECONDARY"] = 2] = "SECONDARY";
    ButtonStyle[ButtonStyle["SUCCESS"] = 3] = "SUCCESS";
    ButtonStyle[ButtonStyle["DANGER"] = 4] = "DANGER";
    ButtonStyle[ButtonStyle["LINK"] = 5] = "LINK";
})(ButtonStyle = exports.ButtonStyle || (exports.ButtonStyle = {}));
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
//# sourceMappingURL=const.js.map