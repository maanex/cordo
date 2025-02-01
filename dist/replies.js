import { InteractionCallbackType, InteractionResponseFlags } from './types/const';
import CordoAPI from './api';
import CordoStatesManager from './manager/states';
import Cordo from './index';
export default class CordoReplies {
    /* TODO @metrics */
    // public static readonly activeInteractionReplyContexts: InteractionReplyContext[] = []
    static activeInteractionReplyContexts = new Map();
    //
    static newInteractionReplyContext(i, customId) {
        const context = {
            id: customId ?? i.id,
            interaction: i,
            timeout: -1,
            timeoutRunFunc: null,
            timeoutRunner: null,
            onInteraction: 'doNothing',
            handlers: new Map(),
            slottedHandlers: new Set()
        };
        this.activeInteractionReplyContexts.set(context.id, context);
        setTimeout((id) => CordoReplies.activeInteractionReplyContexts.delete(id), 15 * 60e3, context.id);
        return context;
    }
    static buildReplyableCommandInteraction(i, slotContext) {
        if (slotContext)
            i.params = slotContext.params;
        return {
            ...i,
            defer(privately = false) {
                return CordoAPI.interactionCallback(i, InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE, privately ? { flags: InteractionResponseFlags.EPHEMERAL } : null);
            },
            reply(data) {
                return CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data);
            },
            replyInteractive(data) {
                const context = CordoReplies.newInteractionReplyContext(i);
                CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data, context.id);
                return CordoReplies.getLevelTwoReplyState(context);
            },
            replyPrivately(data) {
                CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, { ...data, flags: InteractionResponseFlags.EPHEMERAL });
            },
            sendRawResponse(type, data) {
                return CordoAPI.interactionCallback(i, type, data, '', true);
            },
            openModal(data) {
                CordoAPI.interactionCallback(i, InteractionCallbackType.MODAL, data);
            },
            async state(state, ...args) {
                if (!state)
                    state = i.data.name;
                const stateItem = CordoStatesManager.getStateById(state);
                if (!stateItem) {
                    Cordo._data.logger.warn(`Command ${i.data.name} tried to apply state non-existent ${state}`);
                    return;
                }
                let data = stateItem.state({ ...i, params: stateItem.params }, args);
                if (data.then)
                    data = await data;
                CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data);
            }
        };
    }
    static buildReplyableComponentInteraction(i, slotContext) {
        if (slotContext)
            i.params = slotContext.params;
        return {
            ...i,
            ack() {
                CordoAPI.interactionCallback(i, InteractionCallbackType.DEFERRED_UPDATE_MESSAGE);
            },
            reply(data) {
                return CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data);
            },
            replyInteractive(data) {
                const context = CordoReplies.newInteractionReplyContext(i);
                CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data, context.id);
                return CordoReplies.getLevelTwoReplyState(context);
            },
            replyPrivately(data) {
                CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, { ...data, flags: InteractionResponseFlags.EPHEMERAL });
            },
            edit(data) {
                CordoAPI.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, data, CordoReplies.activeInteractionReplyContexts.get(i.message.interaction?.id)?.id);
            },
            editInteractive(data) {
                const isAlreadyInteractive = CordoReplies.activeInteractionReplyContexts.has(i.message?.interaction?.id);
                if (isAlreadyInteractive) {
                    const context = CordoReplies.activeInteractionReplyContexts.get(i.message?.interaction?.id);
                    CordoAPI.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, data, context.id);
                    return CordoReplies.getLevelTwoReplyState(context);
                }
                else {
                    const context = CordoReplies.newInteractionReplyContext(i);
                    CordoAPI.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, data, context.id);
                    return CordoReplies.getLevelTwoReplyState(context);
                }
            },
            sendRawResponse(type, data) {
                return CordoAPI.interactionCallback(i, type, data, '', true);
            },
            openModal(data) {
                CordoAPI.interactionCallback(i, InteractionCallbackType.MODAL, data);
            },
            // disableComponents() { TODO
            //   API.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, {
            //     components: i.message.components
            //   })
            // },
            removeComponents() {
                CordoAPI.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, { components: [] });
            },
            async state(state, ...args) {
                if (!state)
                    state = i.data.custom_id;
                const stateItem = CordoStatesManager.getStateById(state);
                if (!stateItem) {
                    Cordo._data.logger.warn(`Component ${i.data.custom_id} tried to apply state non-existent ${state}`);
                    return;
                }
                let data = stateItem.state({ ...i, params: stateItem.params }, args);
                if (data.then)
                    data = await data;
                CordoAPI.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, data);
            }
        };
    }
    static buildReplyableCommandAutocompleteInteraction(i) {
        return {
            ...i,
            ack() {
                return CordoAPI.interactionCallback(i, InteractionCallbackType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT, { choices: [] });
            },
            show(choices) {
                return CordoAPI.interactionCallback(i, InteractionCallbackType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT, { choices });
            }
        };
    }
    //
    static getJanitor(context) {
        return {
            edit(data) {
                CordoAPI.interactionCallback(context.interaction, InteractionCallbackType.UPDATE_MESSAGE, data);
            },
            removeComponents() {
                CordoAPI.interactionCallback(context.interaction, InteractionCallbackType.UPDATE_MESSAGE, { components: [] });
            },
            disableComponents() {
                CordoAPI.interactionCallback(context.interaction, InteractionCallbackType.UPDATE_MESSAGE, {
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
                const stateItem = CordoStatesManager.getStateById(state);
                if (!stateItem) {
                    Cordo._data.logger.warn(`Janitor tried to apply state non-existent ${state}`);
                    return;
                }
                let data = stateItem.state({ ...context.interaction, params: stateItem.params }, args);
                if (data.then)
                    data = await data;
                CordoAPI.interactionCallback(context.interaction, InteractionCallbackType.UPDATE_MESSAGE, data);
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
                    Cordo._data.logger.error('Interactions timeout cannot be bigger than 15 minutes');
                    timeout = 15 * 60 * 1000;
                }
                context.timeout = timeout;
                context.onInteraction = options?.onInteraction;
                context.timeoutRunFunc = (skipJanitor = false) => {
                    CordoReplies.activeInteractionReplyContexts.delete(context.id);
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
                context.handlers.set(customId, handler);
                if (customId.includes('$')) {
                    context.slottedHandlers.add({
                        id: customId,
                        regex: new RegExp('^' + customId.replace(/\$[a-zA-Z0-9]+/g, '[a-zA-Z0-9]+') + '$'),
                        handler
                    });
                }
                return state;
            },
            edit(data) {
                CordoAPI.interactionCallback(context.interaction, InteractionCallbackType.UPDATE_MESSAGE, data);
            },
            followUp(data) {
                CordoAPI.interactionCallback(context.interaction, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data);
            },
            triggerJanitor() {
                clearTimeout(context.timeoutRunner);
                context.timeoutRunFunc();
            }
        };
        return state;
    }
}
//# sourceMappingURL=replies.js.map