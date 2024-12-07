"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const __1 = require("..");
const replies_1 = require("../replies");
const const_1 = require("../types/const");
const user_error_messages_1 = require("../lib/user-error-messages");
const utils_1 = require("../lib/utils");
const states_1 = require("./states");
class CordoCommandsManager {
    //
    static findCommandHandlers(dir, prefix) {
        if (typeof dir !== 'string')
            dir = path.join(...dir);
        for (const file of fs.readdirSync(dir)) {
            const fullPath = path.join(dir, file);
            let fullName = (prefix ? prefix + '_' : '') + file.split('.')[0];
            while (fullName.endsWith('_'))
                fullName = fullName.substring(0, fullName.length - 1);
            if (file.includes('.')) {
                if (!file.endsWith('.js') && !(process.versions.bun && file.endsWith('.ts')))
                    continue;
                try {
                    CordoCommandsManager.registerCommandHandler(fullName, require(fullPath).default);
                }
                catch (ex) {
                    console.error(ex);
                }
            }
            else {
                CordoCommandsManager.findCommandHandlers(fullPath, fullName);
            }
        }
    }
    static registerCommandHandler(command, handler) {
        if (CordoCommandsManager.commandHandlers.has(command))
            __1.default._data.logger.warn(`Command handler for ${command} got assigned twice. Overriding.`);
        CordoCommandsManager.commandHandlers.set(command, handler);
        if (command.includes('$')) {
            const regex = new RegExp('^' + command.replace(/\$[a-zA-Z0-9]+/g, '[a-zA-Z0-9]+') + '$');
            this.slottedCommandHandlers.add({ command, regex, handler });
        }
    }
    //
    static onCommand(i) {
        let name = i.data.name?.toLowerCase().replace(/ /g, '_').replace(/\W/g, '');
        let type = i.data.options?.[0]?.type;
        while (type === const_1.ApplicationCommandOptionType.SUB_COMMAND || type === const_1.ApplicationCommandOptionType.SUB_COMMAND_GROUP) {
            name += '_' + i.data.options[0].name.toLowerCase().replace(/ /g, '_').replace(/\W/g, '');
            i.data.options = i.data.options[0].options;
            type = i.data.options[0]?.type;
        }
        try {
            i.data.option = {};
            for (const option of i.data.options || [])
                i.data.option[option.name] = option.value;
            //
            if (i.data.type === const_1.InteractionCommandType.USER)
                i.data.target = i.data.resolved.users[i.data.target_id];
            if (i.data.type === const_1.InteractionCommandType.MESSAGE)
                i.data.target = i.data.resolved.messages[i.data.target_id];
            //
            CordoCommandsManager.findAndExecuteHandler(name, i);
        }
        catch (ex) {
            this.onCommandFail(i, ex);
        }
    }
    static findAndExecuteHandler(name, i) {
        if (CordoCommandsManager.commandHandlers.has(name)) {
            const handler = CordoCommandsManager.commandHandlers.get(name);
            handler(replies_1.default.buildReplyableCommandInteraction(i));
            return;
        }
        const regexSearchResult = [...CordoCommandsManager.slottedCommandHandlers.values()]
            .find(h => h.regex.test(name));
        if (regexSearchResult) {
            const params = utils_1.parseParams(regexSearchResult.command, name);
            regexSearchResult.handler(replies_1.default.buildReplyableCommandInteraction(i, { params }));
            return;
        }
        if (states_1.default.getStateById(name + '_main')) {
            replies_1.default.buildReplyableCommandInteraction(i).state(name + '_main');
            return;
        }
        __1.default._data.logger.warn(`Unhandled command "${name}"`);
        user_error_messages_1.default.interactionInvalid(i);
    }
    static onCommandFail(i, ex) {
        __1.default._data.logger.warn(ex);
        try {
            user_error_messages_1.default.interactionFailed(i);
        }
        catch (ex) {
            __1.default._data.logger.warn(ex);
        }
    }
}
exports.default = CordoCommandsManager;
CordoCommandsManager.commandHandlers = new Map();
CordoCommandsManager.slottedCommandHandlers = new Set();
//# sourceMappingURL=commands.js.map