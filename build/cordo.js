"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const const_1 = require("./types/const");
const api_1 = require("./api");
const replies_1 = require("./replies");
const default_logger_1 = require("./lib/default-logger");
const permission_strings_1 = require("./lib/permission-strings");
class Cordo {
    static get _data() {
        return {
            config: Cordo.config,
            commandHandlers: Cordo.commandHandlers,
            componentHandlers: Cordo.componentHandlers,
            uiStates: Cordo.uiStates,
            middlewares: Cordo.middlewares,
            logger: Cordo.logger,
            isBotOwner: Cordo.isBotOwner
        };
    }
    //
    static init(config) {
        this.config = config;
        if (config.contextPath)
            Cordo.findContext(config.contextPath);
        if (config.commandHandlerPath)
            Cordo.findContext(config.commandHandlerPath);
        if (config.componentHandlerPath)
            Cordo.findContext(config.componentHandlerPath);
        if (config.uiStatesPath)
            Cordo.findContext(config.uiStatesPath);
    }
    //
    static registerCommandHandler(command, handler) {
        if (Cordo.commandHandlers[command])
            Cordo.logger.warn(`Command handler for ${command} got assigned twice. Overriding.`);
        Cordo.commandHandlers[command] = handler;
    }
    static registerComponentHandler(id, handler) {
        if (Cordo.componentHandlers[id])
            Cordo.logger.warn(`Component handler for ${id} got assigned twice. Overriding.`);
        Cordo.componentHandlers[id] = handler;
    }
    static registerUiState(id, state) {
        if (Cordo.uiStates[id])
            Cordo.logger.warn(`UI State for ${id} already exists. Overriding.`);
        Cordo.uiStates[id] = state;
    }
    static findCommandHandlers(dir, prefix) {
        if (typeof dir !== 'string')
            dir = path.join(...dir);
        for (const file of fs.readdirSync(dir)) {
            const fullPath = path.join(dir, file);
            let fullName = (prefix ? prefix + '_' : '') + file.split('.')[0];
            while (fullName.endsWith('_'))
                fullName = fullName.substr(0, fullName.length - 1);
            if (file.includes('.')) {
                if (!file.endsWith('.js'))
                    continue;
                Cordo.registerCommandHandler(fullName, require(fullPath).default);
            }
            else {
                Cordo.findCommandHandlers(fullPath, fullName);
            }
        }
    }
    static findComponentHandlers(dir, prefix) {
        if (typeof dir !== 'string')
            dir = path.join(...dir);
        for (const file of fs.readdirSync(dir)) {
            const fullPath = path.join(dir, file);
            let fullName = (prefix ? prefix + '_' : '') + file.split('.')[0];
            while (fullName.endsWith('_'))
                fullName = fullName.substr(0, fullName.length - 1);
            if (file.includes('.')) {
                if (!file.endsWith('.js'))
                    continue;
                Cordo.registerComponentHandler(fullName, require(fullPath).default);
            }
            else {
                Cordo.findComponentHandlers(fullPath, fullName);
            }
        }
    }
    static findUiStates(dir, prefix) {
        if (typeof dir !== 'string')
            dir = path.join(...dir);
        for (const file of fs.readdirSync(dir)) {
            const fullPath = path.join(dir, file);
            let fullName = (prefix ? prefix + '_' : '') + file.split('.')[0];
            while (fullName.endsWith('_'))
                fullName = fullName.substr(0, fullName.length - 1);
            if (file.includes('.')) {
                if (!file.endsWith('.js'))
                    continue;
                Cordo.registerUiState(fullName, require(fullPath).default);
            }
            else {
                Cordo.findUiStates(fullPath, fullName);
            }
        }
    }
    static findContext(dir) {
        if (typeof dir === 'string')
            dir = [dir];
        this.findCommandHandlers([...dir, 'commands']);
        this.findComponentHandlers([...dir, 'components']);
        this.findUiStates([...dir, 'states']);
    }
    //
    static addMiddlewareInteractionCallback(fun) {
        Cordo.middlewares.interactionCallback.push(fun);
    }
    static setMiddlewareGuildData(fun) {
        Cordo.middlewares.fetchGuildData = fun;
    }
    static setMiddlewareUserData(fun) {
        Cordo.middlewares.fetchUserData = fun;
    }
    //
    static async emitInteraction(i) {
        i._answered = false;
        if (i.guild_id && !!Cordo.middlewares.fetchGuildData && typeof Cordo.middlewares.fetchGuildData === 'function') {
            i.guildData = Cordo.middlewares.fetchGuildData(i.guild_id);
            if (!!i.guildData.then)
                i.guildData = await i.guildData;
        }
        if (!i.user)
            i.user = i.member.user;
        if (i.user.id && !!Cordo.middlewares.fetchUserData && typeof Cordo.middlewares.fetchUserData === 'function') {
            i.userData = Cordo.middlewares.fetchUserData(i.user.id);
            if (!!i.userData.then)
                i.userData = await i.userData;
        }
        if (i.type === const_1.InteractionType.COMMAND)
            Cordo.onCommand(i);
        else if (i.type === const_1.InteractionType.COMPONENT)
            Cordo.onComponent(i);
        else
            Cordo.logger.warn(`Unknown interaction type ${i.type}`);
    }
    /*
     * INTERNAL
     */
    static onCommand(i) {
        try {
            for (const option of i.data.options || [])
                i.data.option[option.name] = option.value;
            if (Cordo.commandHandlers[i.data.name]) {
                Cordo.commandHandlers[i.data.name](replies_1.default.buildReplyableCommandInteraction(i));
            }
            else if (Cordo.uiStates[i.data.name + '_main']) {
                replies_1.default.buildReplyableCommandInteraction(i).state(i.data.name + '_main');
            }
            else {
                Cordo.logger.warn(`Unhandled command "${i.data.name}"`);
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE);
            }
        }
        catch (ex) {
            Cordo.logger.warn(ex);
            try {
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE, {
                    content: Cordo.config.texts.interaction_failed,
                    flags: const_1.InteractionResponseFlags.EPHEMERAL
                });
            }
            catch (ex) {
                Cordo.logger.warn(ex);
            }
        }
    }
    static async componentPermissionCheck(i) {
        if (await Cordo.isBotOwner(i.user.id))
            return 'passed';
        if (i.data.flags.includes(const_1.InteractionComponentFlag.ACCESS_BOT_ADMIN))
            return void Cordo.interactionNotPermitted(i, Cordo.config.texts.interaction_not_permitted_description_bot_admin);
        if (!i.data.flags.includes(const_1.InteractionComponentFlag.ACCESS_EVERYONE) && i.message.interaction?.user.id !== i.user.id)
            return void Cordo.interactionNotOwned(i, i.message.interaction ? `/${i.message.interaction?.name}` : 'the command', i.message.interaction?.user.username);
        if (!i.member)
            return 'passed';
        if (i.data.flags.includes(const_1.InteractionComponentFlag.ACCESS_ADMIN) && !permission_strings_1.default.containsAdmin(i.member.permissions))
            return void Cordo.interactionNotPermitted(i, Cordo.config.texts.interaction_not_permitted_description_guild_admin);
        if (i.data.flags.includes(const_1.InteractionComponentFlag.ACCESS_MANAGE_SERVER) && !permission_strings_1.default.containsManageServer(i.member.permissions))
            return void Cordo.interactionNotPermitted(i, Cordo.config.texts.interaction_not_permitted_description_manage_server);
        if (i.data.flags.includes(const_1.InteractionComponentFlag.ACCESS_MANAGE_MESSAGES) && !permission_strings_1.default.containsManageMessages(i.member.permissions))
            return void Cordo.interactionNotPermitted(i, Cordo.config.texts.interaction_not_permitted_description_manage_messages);
        return 'passed';
    }
    static async onComponent(i) {
        i.data.flags = [];
        if (i.data.custom_id.includes('-')) {
            const id = i.data.custom_id.split('-')[0];
            const flags = i.data.custom_id.substr(id.length + 1);
            i.data.custom_id = id;
            i.data.flags = flags.split('-').join('').split('');
        }
        if ((await this.componentPermissionCheck(i)) !== 'passed')
            return;
        const context = replies_1.default.findActiveInteractionReplyContext(i.message.interaction?.id);
        if (context?.resetTimeoutOnInteraction) {
            clearTimeout(context.timeoutRunner);
            setTimeout(context.timeoutRunFunc, context.timeout);
        }
        if (context?.handlers[i.data.custom_id]) {
            context.handlers[i.data.custom_id](replies_1.default.buildReplyableComponentInteraction(i));
        }
        else if (Cordo.componentHandlers[i.data.custom_id]) {
            Cordo.componentHandlers[i.data.custom_id](replies_1.default.buildReplyableComponentInteraction(i));
        }
        else if (Cordo.uiStates[i.data.custom_id]) {
            replies_1.default.buildReplyableComponentInteraction(i).state();
        }
        else {
            Cordo.logger.warn(`Unhandled component with custom_id "${i.data.custom_id}"`);
            api_1.default.interactionCallback(i, const_1.InteractionCallbackType.DEFERRED_UPDATE_MESSAGE);
        }
    }
    static interactionNotPermitted(i, text) {
        return api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, {
            title: Cordo.config.texts.interaction_not_permitted_title,
            description: text || Cordo.config.texts.interaction_not_permitted_description_generic,
            flags: const_1.InteractionResponseFlags.EPHEMERAL
        });
    }
    static interactionNotOwned(i, command, owner) {
        return api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, {
            title: this.config.texts.interaction_not_owned_title,
            description: this.config.texts.interaction_not_owned_description,
            flags: const_1.InteractionResponseFlags.EPHEMERAL,
            _context: { command, owner }
        });
    }
    static isBotOwner(userid) {
        if (!Cordo.config.botAdmins)
            return false;
        if (typeof Cordo.config.botAdmins === 'function')
            return Cordo.config.botAdmins(userid);
        else
            return Cordo.config.botAdmins.includes(userid);
    }
}
exports.default = Cordo;
Cordo.commandHandlers = {};
Cordo.componentHandlers = {};
Cordo.uiStates = {};
Cordo.config = {
    botId: null,
    texts: {
        interaction_not_owned_title: 'Nope!',
        interaction_not_owned_description: 'You cannot interact with this widget as you did not create it. Run the command yourself to get a interactable widget.',
        interaction_not_permitted_title: 'No permission!',
        interaction_not_permitted_description_generic: 'You cannot do this.',
        interaction_not_permitted_description_bot_admin: 'Only bot admins can do this.',
        interaction_not_permitted_description_guild_admin: 'Only server admins.',
        interaction_not_permitted_description_manage_server: 'Only people with the "Manage Server" permission can do this.',
        interaction_not_permitted_description_manage_messages: 'Only people with the "Manage Messages" permission can do this.',
        interaction_failed: 'We are very sorry but an error occured while processing your command. Please try again.'
    }
};
Cordo.logger = new default_logger_1.default();
Cordo.middlewares = {
    interactionCallback: [],
    fetchGuildData: null,
    fetchUserData: null
};
//# sourceMappingURL=cordo.js.map