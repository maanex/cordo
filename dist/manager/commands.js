"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const __1 = require("..");
const replies_1 = require("../replies");
const const_1 = require("../types/const");
const user_error_messages_1 = require("../lib/user-error-messages");
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
                if (!file.endsWith('.js'))
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
    }
    //
    static onCommand(i) {
        const name = i.data.name?.toLowerCase().replace(/ /g, '_').replace(/\W/g, '');
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
            if (CordoCommandsManager.commandHandlers.has(name)) {
                const handler = CordoCommandsManager.commandHandlers.get(name);
                handler(replies_1.default.buildReplyableCommandInteraction(i));
                return;
            }
            if (states_1.default.uiStates.has(name + '_main')) {
                replies_1.default.buildReplyableCommandInteraction(i).state(name + '_main');
                return;
            }
            __1.default._data.logger.warn(`Unhandled command "${name}"`);
            user_error_messages_1.default.interactionInvalid(i);
        }
        catch (ex) {
            this.onCommandFail(i, ex);
        }
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
//# sourceMappingURL=commands.js.map