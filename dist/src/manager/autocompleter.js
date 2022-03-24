"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const __1 = require("..");
const replies_1 = require("../replies");
const api_1 = require("../api");
const const_1 = require("../types/const");
class CordoAutocompleterManager {
    //
    static findAutocompleteHandlers(dir, prefix) {
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
                    CordoAutocompleterManager.registerAutocompleteHandler(fullName, require(fullPath).default);
                }
                catch (ex) {
                    console.error(ex);
                }
            }
            else {
                CordoAutocompleterManager.findAutocompleteHandlers(fullPath, fullName);
            }
        }
    }
    static registerAutocompleteHandler(id, handler) {
        if (CordoAutocompleterManager.autocompleteHandlers.has(id))
            __1.default._data.logger.warn(`Autocompleter for ${id} got assigned twice. Overriding.`);
        CordoAutocompleterManager.autocompleteHandlers.set(id, handler);
    }
    //
    static onCommandAutocomplete(i) {
        const focused = i.data.options.find(o => o.focused);
        const name = `${i.data.name}_${focused?.name}`
            ?.toLowerCase()
            .replace(/ /g, '_')
            .replace(/\W/g, '');
        i.data.input = focused?.value ?? '';
        //
        if (CordoAutocompleterManager.autocompleteHandlers.has(name)) {
            const handler = CordoAutocompleterManager.autocompleteHandlers.get(name);
            handler(replies_1.default.buildReplyableCommandAutocompleteInteraction(i));
            return;
        }
        __1.default._data.logger.warn(`Missing autocompleter for command "${name}"`);
        api_1.default.interactionCallback(i, const_1.InteractionCallbackType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT, { choices: [] });
    }
}
exports.default = CordoAutocompleterManager;
CordoAutocompleterManager.autocompleteHandlers = new Map();
//# sourceMappingURL=autocompleter.js.map