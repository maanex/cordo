import * as fs from 'fs';
import * as path from 'path';
import Cordo from '..';
import { parseParams } from '../lib/utils';
export default class CordoStatesManager {
    static uiStates = new Map();
    static slottedUiStates = new Set();
    //
    static async findUiStates(dir, prefix) {
        if (typeof dir !== 'string')
            dir = path.join(...dir);
        if (!fs.existsSync(dir))
            return;
        for (const file of fs.readdirSync(dir)) {
            const fullPath = path.join(dir, file);
            let fullName = (prefix ? prefix + '_' : '') + file.split('.')[0];
            while (fullName.endsWith('_'))
                fullName = fullName.substring(0, fullName.length - 1);
            if (file.includes('.')) {
                if (!file.endsWith('.js') && !(process.versions.bun && file.endsWith('.ts')))
                    continue;
                CordoStatesManager.registerUiState(fullName, (await import(fullPath)).default);
            }
            else {
                CordoStatesManager.findUiStates(fullPath, fullName);
            }
        }
    }
    static registerUiState(id, state) {
        if (CordoStatesManager.uiStates.has(id))
            Cordo._data.logger.warn(`UI State for ${id} already exists. Overriding.`);
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
                params: parseParams(regexSearchResult.id, id)
            };
        }
        return null;
    }
}
//# sourceMappingURL=states.js.map