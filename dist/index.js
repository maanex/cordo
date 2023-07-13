"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_interactions_1 = require("discord-interactions");
const const_1 = require("./types/const");
const api_1 = require("./api");
const default_logger_1 = require("./lib/default-logger");
const commands_1 = require("./manager/commands");
const components_1 = require("./manager/components");
const states_1 = require("./manager/states");
const autocompleter_1 = require("./manager/autocompleter");
__exportStar(require("./api"), exports);
__exportStar(require("./replies"), exports);
__exportStar(require("./lib/default-logger"), exports);
__exportStar(require("./lib/permission-strings"), exports);
__exportStar(require("./types/base"), exports);
__exportStar(require("./types/component"), exports);
__exportStar(require("./types/const"), exports);
__exportStar(require("./types/custom"), exports);
__exportStar(require("./types/middleware"), exports);
class Cordo {
    static get _data() {
        return Cordo.__data;
    }
    //
    static init(config) {
        if (!config.texts)
            config.texts = Cordo._data.config.texts;
        Cordo._data.config = config;
        if (config.contextPath)
            Cordo.findContext(config.contextPath);
        if (config.commandHandlerPath)
            commands_1.default.findCommandHandlers(config.commandHandlerPath);
        if (config.componentHandlerPath)
            components_1.default.findComponentHandlers(config.componentHandlerPath);
        if (config.uiStatesPath)
            states_1.default.findUiStates(config.uiStatesPath);
        if (config.autocompleterPath)
            autocompleter_1.default.findAutocompleteHandlers(config.autocompleterPath);
    }
    //
    static findContext(dir) {
        if (typeof dir === 'string')
            dir = [dir];
        try {
            commands_1.default.findCommandHandlers([...dir, 'commands']);
        }
        catch (ignore) { }
        try {
            components_1.default.findComponentHandlers([...dir, 'components']);
        }
        catch (ignore) { }
        try {
            states_1.default.findUiStates([...dir, 'states']);
        }
        catch (ignore) { }
        try {
            autocompleter_1.default.findAutocompleteHandlers([...dir, 'autocompleter']);
        }
        catch (ignore) { }
    }
    static updateBotId(newId) {
        Cordo._data.config.botId = newId;
    }
    //
    static findCommandHandlers(dir, prefix) {
        commands_1.default.findCommandHandlers(dir, prefix);
    }
    static registerCommandHandler(command, handler) {
        commands_1.default.registerCommandHandler(command, handler);
    }
    static findComponentHandlers(dir, prefix) {
        components_1.default.findComponentHandlers(dir, prefix);
    }
    static registerComponentHandler(id, handler) {
        components_1.default.registerComponentHandler(id, handler);
    }
    static findUiStates(dir, prefix) {
        states_1.default.findUiStates(dir, prefix);
    }
    static registerUiState(id, state) {
        states_1.default.registerUiState(id, state);
    }
    static findAutocompleteHandlers(dir, prefix) {
        autocompleter_1.default.findAutocompleteHandlers(dir, prefix);
    }
    static registerAutocompleteHandler(id, handler) {
        autocompleter_1.default.registerAutocompleteHandler(id, handler);
    }
    //
    static addMiddlewareInteractionCallback(fun) {
        Cordo._data.middlewares.interactionCallback.push(fun);
    }
    static setMiddlewareGuildData(fun) {
        Cordo._data.middlewares.fetchGuildData = fun;
    }
    static setMiddlewareUserData(fun) {
        Cordo._data.middlewares.fetchUserData = fun;
    }
    static setMiddlewareApiResponseHandler(fun) {
        Cordo._data.middlewares.apiResponseHandler = fun;
    }
    //
    static async emitInteraction(i) {
        i._answered = false;
        if (Cordo._data.config.immediateDefer?.(i)) {
            if (i.type === const_1.InteractionType.COMMAND)
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE);
            else if (i.type === const_1.InteractionType.COMPONENT)
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.DEFERRED_UPDATE_MESSAGE);
        }
        if (i.guild_id && !!Cordo._data.middlewares.fetchGuildData && typeof Cordo._data.middlewares.fetchGuildData === 'function') {
            i.guildData = Cordo._data.middlewares.fetchGuildData(i.guild_id, i);
            if (!!i.guildData.then)
                i.guildData = await i.guildData;
        }
        if (!i.user)
            i.user = i.member.user;
        if (i.user.id && !!Cordo._data.middlewares.fetchUserData && typeof Cordo._data.middlewares.fetchUserData === 'function') {
            i.userData = Cordo._data.middlewares.fetchUserData(i.user.id, i);
            if (!!i.userData.then)
                i.userData = await i.userData;
        }
        if (i.type === const_1.InteractionType.COMMAND)
            commands_1.default.onCommand(i);
        else if (i.type === const_1.InteractionType.COMPONENT)
            components_1.default.onComponent(i);
        else if (i.type === const_1.InteractionType.COMMAND_AUTOCOMPLETE)
            autocompleter_1.default.onCommandAutocomplete(i);
        else if (i.type === const_1.InteractionType.MODAL_SUBMIT) // TODO fix this, temp solution
            components_1.default.onComponent(i);
        else
            Cordo._data.logger.warn(`Unknown interaction type ${i.type}`);
    }
    static useWithExpress(clientPublicKey) {
        if (!clientPublicKey)
            throw new Error('You must specify a Discord client public key');
        const checkKey = (0, discord_interactions_1.verifyKeyMiddleware)(clientPublicKey);
        return (req, res) => {
            checkKey(req, res, () => {
                const interaction = req.body;
                interaction._httpCallback = (payload) => res.status(200).json(payload);
                Cordo.emitInteraction(interaction);
            });
        };
    }
}
exports.default = Cordo;
Cordo.__data = {
    config: {
        botId: null,
        texts: {
            interaction_not_owned_title: 'Nope!',
            interaction_not_owned_description: 'You cannot interact with this widget as you did not create it. Run the command yourself to get a interactable widget.',
            interaction_not_permitted_title: 'No permission!',
            interaction_not_permitted_description_generic: 'You cannot do this.',
            interaction_not_permitted_description_bot_admin: 'Only bot admins can do this.',
            interaction_not_permitted_description_guild_admin: 'Only for server admins.',
            interaction_not_permitted_description_manage_server: 'Only people with the "Manage Server" permission can do this.',
            interaction_not_permitted_description_manage_messages: 'Only people with the "Manage Messages" permission can dothis.',
            interaction_failed: 'We are very sorry but an error occured while processing your command. Please try again.',
            interaction_invalid_title: 'Error executing this command',
            interaction_invalid_description: 'The command was not found. Please contact the developer.'
        }
    },
    commandHandlers: commands_1.default.commandHandlers,
    componentHandlers: components_1.default.componentHandlers,
    slottedComponentHandlers: components_1.default.slottedComponentHandlers,
    uiStates: states_1.default.uiStates,
    slottedUiStates: states_1.default.slottedUiStates,
    middlewares: {
        interactionCallback: [],
        fetchGuildData: null,
        fetchUserData: null,
        apiResponseHandler: null
    },
    logger: new default_logger_1.default()
};
//# sourceMappingURL=index.js.map