"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const const_1 = require("./types/const");
const api_1 = require("./api");
const index_1 = require("./index");
class CordoReplies {
    //
    static findActiveInteractionReplyContext(id) {
        if (!id)
            return null;
        return CordoReplies.activeInteractionReplyContexts.find(c => c.id === id);
    }
    //
    static newInteractionReplyContext(i) {
        return {
            id: i.id,
            interaction: i,
            timeout: -1,
            timeoutRunFunc: null,
            timeoutRunner: null,
            onInteraction: 'doNothing',
            handlers: {},
            slottedHandlers: []
        };
    }
    static buildReplyableCommandInteraction(i) {
        return {
            ...i,
            defer(privately = false) {
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE, privately ? { flags: const_1.InteractionResponseFlags.EPHEMERAL } : null);
            },
            reply(data) {
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data);
            },
            replyInteractive(data) {
                const context = CordoReplies.newInteractionReplyContext(i);
                CordoReplies.activeInteractionReplyContexts.push(context);
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data, context.id);
                setTimeout(() => CordoReplies.activeInteractionReplyContexts.splice(0, 1), 15 * 60e3);
                return CordoReplies.getLevelTwoReplyState(context);
            },
            replyPrivately(data) {
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, { ...data, flags: const_1.InteractionResponseFlags.EPHEMERAL });
            },
            async state(state, ...args) {
                if (!state)
                    state = i.data.name;
                if (!index_1.default._data.uiStates[state]) {
                    index_1.default._data.logger.warn(`Command ${i.data.name} tried to apply state non-existent ${state}`);
                    return;
                }
                let data = index_1.default._data.uiStates[state](i, args);
                if (data.then)
                    data = await data;
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data);
            }
        };
    }
    static buildReplyableComponentInteraction(i, slotContext) {
        if (slotContext)
            i.params = slotContext.params;
        return {
            ...i,
            ack() {
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.DEFERRED_UPDATE_MESSAGE);
            },
            reply(data) {
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data);
            },
            replyInteractive(data) {
                const context = CordoReplies.newInteractionReplyContext(i);
                CordoReplies.activeInteractionReplyContexts.push(context);
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data, context.id);
                setTimeout(() => CordoReplies.activeInteractionReplyContexts.splice(0, 1), 15 * 60e3);
                return CordoReplies.getLevelTwoReplyState(context);
            },
            replyPrivately(data) {
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, { ...data, flags: const_1.InteractionResponseFlags.EPHEMERAL });
            },
            edit(data) {
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.UPDATE_MESSAGE, data, CordoReplies.findActiveInteractionReplyContext(i.message.interaction?.id)?.id);
            },
            editInteractive(data) {
                const prevContext = CordoReplies.findActiveInteractionReplyContext(i.id);
                if (prevContext)
                    prevContext.timeoutRunFunc(true);
                const context = CordoReplies.newInteractionReplyContext(i);
                CordoReplies.activeInteractionReplyContexts.push(context);
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.UPDATE_MESSAGE, data, context.id);
                setTimeout(() => CordoReplies.activeInteractionReplyContexts.splice(0, 1), 15 * 60e3);
                return CordoReplies.getLevelTwoReplyState(context);
            },
            // disableComponents() { TODO
            //   API.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, {
            //     components: i.message.components
            //   })
            // },
            removeComponents() {
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.UPDATE_MESSAGE, { components: [] });
            },
            async state(state, ...args) {
                if (!state)
                    state = i.data.custom_id;
                if (!index_1.default._data.uiStates[state]) {
                    index_1.default._data.logger.warn(`Component ${i.data.custom_id} tried to apply state non-existent ${state}`);
                    return;
                }
                let data = index_1.default._data.uiStates[state](i, args);
                if (data.then)
                    data = await data;
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.UPDATE_MESSAGE, data);
            }
        };
    }
    //
    static getJanitor(context) {
        return {
            edit(data) {
                api_1.default.interactionCallback(context.interaction, const_1.InteractionCallbackType.UPDATE_MESSAGE, data);
            },
            removeComponents() {
                api_1.default.interactionCallback(context.interaction, const_1.InteractionCallbackType.UPDATE_MESSAGE, { components: [] });
            },
            disableComponents() {
                api_1.default.interactionCallback(context.interaction, const_1.InteractionCallbackType.UPDATE_MESSAGE, {
                    components: (context.interaction._answerComponents || [])
                        .map(row => ({
                        ...row,
                        components: row.components.map(c => ({
                            ...c,
                            disabled: true
                        }))
                    }))
                }, null, true);
            },
            async state(state, ...args) {
                if (!state)
                    state = context.interaction.id;
                if (!index_1.default._data.uiStates[state]) {
                    index_1.default._data.logger.warn(`Janitor tried to apply state non-existent ${state}`);
                    return;
                }
                let data = index_1.default._data.uiStates[state](context.interaction, args);
                if (data.then)
                    data = await data;
                api_1.default.interactionCallback(context.interaction, const_1.InteractionCallbackType.UPDATE_MESSAGE, data);
            }
        };
    }
    /**
     * Gets the object to .withTimeout(...) on
     */
    static getLevelTwoReplyState(context) {
        return {
            _context: context,
            withTimeout(timeout, janitor, options) {
                if (timeout > 15 * 60 * 1000) {
                    index_1.default._data.logger.error('Interactions timeout cannot be bigger than 15 minutes');
                    timeout = 15 * 60 * 1000;
                }
                context.timeout = timeout;
                context.onInteraction = options?.onInteraction;
                context.timeoutRunFunc = (skipJanitor = false) => {
                    if (!skipJanitor)
                        janitor(CordoReplies.getJanitor(context));
                    delete context.handlers;
                    delete context.slottedHandlers;
                    context.handlers = null;
                    context.slottedHandlers = null;
                };
                context.timeoutRunner = setTimeout(context.timeoutRunFunc, timeout);
                return CordoReplies.getLevelThreeReplyState(context);
            }
        };
    }
    /**
     * Gets the object to .on(...) on
     */
    static getLevelThreeReplyState(context) {
        const state = {
            _context: context,
            on(customId, handler) {
                if (!context.handlers)
                    return; // => timeout already reached and object destroyed
                context.handlers[customId] = handler;
                if (customId.includes('$')) {
                    context.slottedHandlers.push({
                        id: customId,
                        regex: new RegExp(customId.replace(/\$[a-zA-Z0-9]+/g, '[a-zA-Z0-9]+')),
                        handler
                    });
                }
                return state;
            },
            edit(data) {
                api_1.default.interactionCallback(context.interaction, const_1.InteractionCallbackType.UPDATE_MESSAGE, data);
            },
            followUp(data) {
                api_1.default.interactionCallback(context.interaction, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data);
            },
            triggerJanitor() {
                clearTimeout(context.timeoutRunner);
                context.timeoutRunFunc();
            }
        };
        return state;
    }
}
exports.default = CordoReplies;
/* TODO @metrics */
CordoReplies.activeInteractionReplyContexts = [];
//# sourceMappingURL=replies.js.map