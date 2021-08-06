"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const const_1 = require("./types/const");
const api_1 = require("./api");
const index_1 = require("./index");
class CordoReplies {
    //
    static findActiveInteractionReplyContext(id) {
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
            resetTimeoutOnInteraction: false,
            removeTimeoutOnInteraction: false,
            handlers: {}
        };
    }
    static buildReplyableCommandInteraction(i) {
        return {
            ...i,
            ack() {
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE);
            },
            reply(data) {
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data);
            },
            replyInteractive(data) {
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data);
                const context = CordoReplies.newInteractionReplyContext(i);
                CordoReplies.activeInteractionReplyContexts.push(context);
                setTimeout(() => CordoReplies.activeInteractionReplyContexts.splice(0, 1), 15 * 60e3);
                return CordoReplies.getLevelTwoReplyState(context);
            },
            replyPrivately(data) {
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, { ...data, flags: const_1.InteractionResponseFlags.EPHEMERAL });
            },
            async state(state, ...args) {
                if (!state)
                    state = i.data.id;
                if (!index_1.default._data.uiStates[state]) {
                    index_1.default._data.logger.warn(`Component ${i.data.custom_id} tried to apply state non-existent ${state}`);
                    return;
                }
                let data = index_1.default._data.uiStates[state](i, args);
                if (data.then)
                    data = await data;
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data);
            }
        };
    }
    static buildReplyableComponentInteraction(i) {
        return {
            ...i,
            ack() {
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.DEFERRED_UPDATE_MESSAGE);
            },
            reply(data) {
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data);
            },
            replyInteractive(data) {
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data);
                const context = CordoReplies.newInteractionReplyContext(i);
                CordoReplies.activeInteractionReplyContexts.push(context);
                setTimeout(() => CordoReplies.activeInteractionReplyContexts.splice(0, 1), 15 * 60e3);
                return CordoReplies.getLevelTwoReplyState(context);
            },
            replyPrivately(data) {
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, { ...data, flags: const_1.InteractionResponseFlags.EPHEMERAL });
            },
            edit(data) {
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.UPDATE_MESSAGE, data);
            },
            editInteractive(data) {
                api_1.default.interactionCallback(i, const_1.InteractionCallbackType.UPDATE_MESSAGE, data);
                const context = CordoReplies.newInteractionReplyContext(i);
                CordoReplies.activeInteractionReplyContexts.push(context);
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
                    components: context.interaction._answerComponents
                        .map(row => row.components.map(c => ({ ...c, disabled: true })))
                }, true);
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
                    return {};
                }
                context.timeout = timeout;
                context.resetTimeoutOnInteraction = options?.resetTimeoutOnInteraction;
                context.removeTimeoutOnInteraction = options?.removeTimeoutOnInteraction;
                context.timeoutRunFunc = () => {
                    janitor(CordoReplies.getJanitor(context));
                    delete context.handlers;
                    context.handlers = null;
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
                return state;
            }
        };
        return state;
    }
}
exports.default = CordoReplies;
/* TODO @metrics */
CordoReplies.activeInteractionReplyContexts = [];
//# sourceMappingURL=replies.js.map