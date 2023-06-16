"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const __1 = require("..");
const utils_1 = require("../lib/utils");
class CordoStatesManager {
    //
    static findUiStates(dir, prefix) {
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
                CordoStatesManager.registerUiState(fullName, require(fullPath).default);
            }
            else {
                CordoStatesManager.findUiStates(fullPath, fullName);
            }
        }
    }
    static registerUiState(id, state) {
        if (CordoStatesManager.uiStates.has(id))
            __1.default._data.logger.warn(`UI State for ${id} already exists. Overriding.`);
        CordoStatesManager.uiStates.set(id, state);
        if (id.includes('$')) {
            const regex = new RegExp('^' + id.replace(/\$[a-zA-Z0-9]+/g, '[a-zA-Z0-9]+') + '$');
            CordoStatesManager.slottedUiStates.add({ id, regex, state });
        }
    }
    static getStateById(id) {
        if (CordoStatesManager.uiStates.has(id)) {
            return {
                state: CordoStatesManager.uiStates.get(id),
                params: {}
            };
        }
        const regexSearchResult = [...CordoStatesManager.slottedUiStates.values()]
            .find(h => h.regex.test(id));
        if (regexSearchResult) {
            return {
                state: regexSearchResult.state,
                params: (0, utils_1.parseParams)(regexSearchResult.id, id)
            };
        }
        return null;
    }
}
exports.default = CordoStatesManager;
CordoStatesManager.uiStates = new Map();
CordoStatesManager.slottedUiStates = new Set();
//# sourceMappingURL=states.js.map