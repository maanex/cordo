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
__exportStar(require("./api"), exports);
// export * from './replies'
// export * from './lib/default-logger'
// export * from './lib/permission-strings'
// export * from './types/base'
// export * from './types/component'
// export * from './types/const'
// export * from './types/custom'
// export * from './types/middleware'
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
            CordoCommandsManager.findCommandHandlers(config.commandHandlerPath);
        if (config.componentHandlerPath)
            CordoComponentsManager.findComponentHandlers(config.componentHandlerPath);
        if (config.uiStatesPath)
            CordoStatesManager.findUiStates(config.uiStatesPath);
        if (config.autocompleterPath)
            CordoAutocompleterManager.findAutocompleteHandlers(config.autocompleterPath);
    }
    //
    static findContext(dir) {
        if (typeof dir === 'string')
            dir = [dir];
        try {
            CordoCommandsManager.findCommandHandlers([...dir, 'commands']);
        }
        catch (ignore) { }
        try {
            CordoComponentsManager.findComponentHandlers([...dir, 'components']);
        }
        catch (ignore) { }
        try {
            CordoStatesManager.findUiStates([...dir, 'states']);
        }
        catch (ignore) { }
        try {
            CordoAutocompleterManager.findAutocompleteHandlers([...dir, 'autocompleter']);
        }
        catch (ignore) { }
    }
    static updateBotId(newId) {
        Cordo._data.config.botId = newId;
    }
    //
    static findCommandHandlers(dir, prefix) {
        CordoCommandsManager.findCommandHandlers(dir, prefix);
    }
    static registerCommandHandler(command, handler) {
        CordoCommandsManager.registerCommandHandler(command, handler);
    }
    static findComponentHandlers(dir, prefix) {
        CordoComponentsManager.findComponentHandlers(dir, prefix);
    }
    static registerComponentHandler(id, handler) {
        CordoComponentsManager.registerComponentHandler(id, handler);
    }
    static findUiStates(dir, prefix) {
        CordoStatesManager.findUiStates(dir, prefix);
    }
    static registerUiState(id, state) {
        CordoStatesManager.registerUiState(id, state);
    }
    static findAutocompleteHandlers(dir, prefix) {
        CordoAutocompleterManager.findAutocompleteHandlers(dir, prefix);
    }
    static registerAutocompleteHandler(id, handler) {
        CordoAutocompleterManager.registerAutocompleteHandler(id, handler);
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
            if (i.type === InteractionType.COMMAND)
                CordoAPI.interactionCallback(i, InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE);
            else if (i.type === InteractionType.COMPONENT)
                CordoAPI.interactionCallback(i, InteractionCallbackType.DEFERRED_UPDATE_MESSAGE);
        }
        if (i.guild_id && !!Cordo._data.middlewares.fetchGuildData && typeof Cordo._data.middlewares.fetchGuildData === 'function') {
            i.guildData = Cordo._data.middlewares.fetchGuildData(i.guild_id);
            if (!!i.guildData.then)
                i.guildData = await i.guildData;
        }
        if (!i.user)
            i.user = i.member.user;
        if (i.user.id && !!Cordo._data.middlewares.fetchUserData && typeof Cordo._data.middlewares.fetchUserData === 'function') {
            i.userData = Cordo._data.middlewares.fetchUserData(i.user.id);
            if (!!i.userData.then)
                i.userData = await i.userData;
        }
        if (i.type === InteractionType.COMMAND)
            CordoCommandsManager.onCommand(i);
        else if (i.type === InteractionType.COMPONENT)
            CordoComponentsManager.onComponent(i);
        else if (i.type === InteractionType.COMMAND_AUTOCOMPLETE)
            CordoAutocompleterManager.onCommandAutocomplete(i);
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
    commandHandlers: CordoCommandsManager.commandHandlers,
    componentHandlers: CordoComponentsManager.componentHandlers,
    slottedComponentHandlers: CordoComponentsManager.slottedComponentHandlers,
    uiStates: CordoStatesManager.uiStates,
    middlewares: {
        interactionCallback: [],
        fetchGuildData: null,
        fetchUserData: null,
        apiResponseHandler: null
    },
    logger: new DefaultLogger()
};
//# sourceMappingURL=index.js.map