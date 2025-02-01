"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const __1 = require("..");
const api_1 = require("../api");
const replies_1 = require("../replies");
const const_1 = require("../types/const");
const permission_checks_1 = require("../lib/permission-checks");
const utils_1 = require("../lib/utils");
const states_1 = require("./states");
class CordoComponentsManager {
    //
    static async findComponentHandlers(dir, prefix) {
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
                CordoComponentsManager.registerComponentHandler(fullName, (await Promise.resolve().then(() => require(fullPath))).default);
            }
            else {
                CordoComponentsManager.findComponentHandlers(fullPath, fullName);
            }
        }
    }
    static registerComponentHandler(id, handler) {
        if (CordoComponentsManager.componentHandlers.has(id))
            __1.default._data.logger.warn(`Component handler for ${id} got assigned twice. Overriding.`);
        CordoComponentsManager.componentHandlers.set(id, handler);
        if (id.includes('$')) {
            const regex = new RegExp('^' + id.replace(/\$[a-zA-Z0-9]+/g, '[a-zA-Z0-9]+') + '$');
            CordoComponentsManager.slottedComponentHandlers.add({ id, regex, handler });
        }
    }
    //
    static async onComponent(i) {
        const { contextId, customId, flagsRaw } = api_1.default.parseCustomId(i.data.custom_id);
        i.data.custom_id = customId;
        i.data.flags = flagsRaw?.split('') ?? [];
        if (!(await permission_checks_1.default.componentPermissionCheck(i)))
            return;
        const context = replies_1.default.activeInteractionReplyContexts.get(contextId);
        CordoComponentsManager.findAndExecuteHandler(i, context);
        if (context)
            CordoComponentsManager.contextOnInteraction(context);
    }
    static findAndExecuteHandler(i, context) {
        let regexSearchResult = null;
        if (context?.handlers?.has(i.data.custom_id)) {
            const handler = context.handlers.get(i.data.custom_id);
            handler(replies_1.default.buildReplyableComponentInteraction(i));
            return;
        }
        regexSearchResult = context?.slottedHandlers
            ? [...context.slottedHandlers.values()]
                .find(h => h.regex.test(i.data.custom_id))
            : null;
        if (regexSearchResult) {
            const params = utils_1.parseParams(regexSearchResult.id, i.data.custom_id);
            regexSearchResult.handler(replies_1.default.buildReplyableComponentInteraction(i, { params }));
            return;
        }
        if (CordoComponentsManager.componentHandlers.has(i.data.custom_id)) {
            const handler = CordoComponentsManager.componentHandlers.get(i.data.custom_id);
            handler(replies_1.default.buildReplyableComponentInteraction(i));
            return;
        }
        regexSearchResult = [...CordoComponentsManager.slottedComponentHandlers.values()]
            .find(h => h.regex.test(i.data.custom_id));
        if (regexSearchResult) {
            const params = utils_1.parseParams(regexSearchResult.id, i.data.custom_id);
            regexSearchResult.handler(replies_1.default.buildReplyableComponentInteraction(i, { params }));
            return;
        }
        if (states_1.default.getStateById(i.data.custom_id)) {
            replies_1.default.buildReplyableComponentInteraction(i).state();
            return;
        }
        if (!context?.id)
            __1.default._data.logger.warn(`Unhandled component with custom_id "${i.data.custom_id}"`);
        api_1.default.interactionCallback(i, const_1.InteractionCallbackType.DEFERRED_UPDATE_MESSAGE);
    }
    static contextOnInteraction(context) {
        if (context.onInteraction === 'restartTimeout') {
            clearTimeout(context.timeoutRunner);
            setTimeout(context.timeoutRunFunc, context.timeout);
            return;
        }
        if (context.onInteraction === 'triggerTimeout') {
            clearTimeout(context.timeoutRunner);
            context.timeoutRunFunc();
            return;
        }
        if (context.onInteraction === 'removeTimeout') {
            clearTimeout(context.timeoutRunner);
            context.timeoutRunFunc(true);
            return;
        }
    }
}
exports.default = CordoComponentsManager;
CordoComponentsManager.componentHandlers = new Map();
CordoComponentsManager.slottedComponentHandlers = new Set();
//# sourceMappingURL=components.js.map