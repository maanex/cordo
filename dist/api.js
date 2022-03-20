"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const permission_strings_1 = require("./lib/permission-strings");
const const_1 = require("./types/const");
const const_2 = require("./types/const");
const permission_checks_1 = require("./lib/permission-checks");
const index_1 = require("./index");
class CordoAPI {
    static async interactionCallback(i, type, data, contextId, useRaw) {
        if (!useRaw)
            CordoAPI.normaliseData(data, i, contextId, type);
        if (data?.components)
            i._answerComponents = data.components;
        if (!i._answered) {
            i._answered = true;
            if (!!i._httpCallback) {
                i._httpCallback({ type, data });
            }
            else {
                const res = await axios_1.default.post(`https://discord.com/api/v9/interactions/${i.id}/${i.token}/callback`, { type, data }, { validateStatus: null });
                CordoAPI.handleCallbackResponse(res, type, data);
            }
        }
        else {
            switch (type) {
                case const_2.InteractionCallbackType.PONG: break;
                case const_2.InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: break;
                case const_2.InteractionCallbackType.DEFERRED_UPDATE_MESSAGE: break;
                case const_2.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE: {
                    const res = await axios_1.default.post(`https://discord.com/api/v9/webhooks/${index_1.default._data.config.botId}/${i.token}`, data, { validateStatus: null });
                    CordoAPI.handleCallbackResponse(res, type, data);
                    break;
                }
                case const_2.InteractionCallbackType.UPDATE_MESSAGE: {
                    const res = await axios_1.default.patch(`https://discord.com/api/v9/webhooks/${index_1.default._data.config.botId}/${i.token}/messages/@original`, data, { validateStatus: null });
                    CordoAPI.handleCallbackResponse(res, type, data);
                    break;
                }
                case const_2.InteractionCallbackType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: break;
                case const_2.InteractionCallbackType.MODAL: break;
            }
        }
        return {
            async getMessage() {
                const res = await axios_1.default.get(`https://discord.com/api/v8/webhooks/${index_1.default._data.config.botId}/${i.token}/messages/@original`, { validateStatus: null });
                if (res.status !== 200)
                    return null;
                return res.data;
            },
            edit(editData, editUseRaw = useRaw) {
                CordoAPI.interactionCallback(i, const_2.InteractionCallbackType.UPDATE_MESSAGE, editData, contextId, editUseRaw);
            }
        };
    }
    static handleCallbackResponse(res, type, data) {
        if (index_1.default._data.middlewares.apiResponseHandler) {
            index_1.default._data.middlewares.apiResponseHandler(res);
        }
        else if (res.status >= 300) {
            index_1.default._data.logger.warn('Interaction callback failed with error:');
            index_1.default._data.logger.warn(JSON.stringify(res.data, null, 2));
            index_1.default._data.logger.warn('Request payload:');
            index_1.default._data.logger.warn(JSON.stringify({ type, data }, null, 2));
        }
    }
    /**
     * Transforms the shorthand way of writing into proper discord api compatible objects
     */
    static normaliseData(data, i, contextId, type) {
        if (!data)
            return;
        // explicitly not using this. in this function due to unwanted side-effects in lambda functions
        index_1.default._data.middlewares.interactionCallback.forEach(f => f(data, i));
        CordoAPI.normalizeFindAndResolveSmartEmbed(data, type);
        const isEmphemeral = (data.flags & const_1.InteractionResponseFlags.EPHEMERAL) !== 0;
        if (data.components?.length && data.components[0].type !== const_2.ComponentType.ROW) {
            const rows = [];
            let newlineFlag = true;
            for (const comp of data.components) {
                if (comp.visible === false)
                    continue; // === false to not catch any null or undefined
                if (comp.type !== const_2.ComponentType.LINE_BREAK && !!comp.custom_id) {
                    const hasAccessEveryoneFlag = comp.flags?.includes(const_2.InteractionComponentFlag.ACCESS_EVERYONE);
                    if (isEmphemeral && !hasAccessEveryoneFlag) {
                        if (!comp.flags)
                            comp.flags = [];
                        comp.flags.push(const_2.InteractionComponentFlag.ACCESS_EVERYONE);
                    }
                    ;
                    comp.custom_id = CordoAPI.compileCustomId(comp.custom_id, comp.flags, contextId);
                    if (comp.flags?.length && !!i.member && !hasAccessEveryoneFlag) {
                        const perms = BigInt(i.member.permissions);
                        if (comp.flags.includes(const_2.InteractionComponentFlag.ACCESS_ADMIN) && !permission_strings_1.default.containsAdmin(perms)) {
                            if (comp.flags.includes(const_2.InteractionComponentFlag.HIDE_IF_NOT_ALLOWED))
                                comp.type = null;
                            else
                                comp.disabled = true;
                        }
                        else if (comp.flags.includes(const_2.InteractionComponentFlag.ACCESS_MANAGE_SERVER) && !permission_strings_1.default.containsManageServer(perms)) {
                            if (comp.flags.includes(const_2.InteractionComponentFlag.HIDE_IF_NOT_ALLOWED))
                                comp.type = null;
                            else
                                comp.disabled = true;
                        }
                        else if (comp.flags.includes(const_2.InteractionComponentFlag.ACCESS_MANAGE_MESSAGES) && !permission_strings_1.default.containsManageMessages(perms)) {
                            if (comp.flags.includes(const_2.InteractionComponentFlag.HIDE_IF_NOT_ALLOWED))
                                comp.type = null;
                            else
                                comp.disabled = true;
                        }
                        else if (comp.flags.includes(const_2.InteractionComponentFlag.ACCESS_BOT_ADMIN) && !permission_checks_1.default.isBotOwner(i.user.id)) {
                            if (comp.flags.includes(const_2.InteractionComponentFlag.HIDE_IF_NOT_ALLOWED))
                                comp.type = null;
                            else
                                comp.disabled = true;
                        }
                    }
                    delete comp.flags;
                }
                switch (comp.type) {
                    case const_2.ComponentType.LINE_BREAK: {
                        if (rows[rows.length - 1].length)
                            newlineFlag = true;
                        break;
                    }
                    case const_2.ComponentType.BUTTON: {
                        if (newlineFlag)
                            rows.push([]);
                        newlineFlag = false;
                        if (comp.label?.length > 50)
                            comp.label = comp.label.substr(0, 50);
                        rows[rows.length - 1].push(comp);
                        if (rows[rows.length - 1].length >= 5)
                            newlineFlag = true;
                        break;
                    }
                    case const_2.ComponentType.SELECT: {
                        if (comp.options?.length > 50)
                            comp.options.length = 50;
                        rows.push([comp]);
                        newlineFlag = true;
                    }
                }
            }
            data.components = rows.map(c => ({ type: const_2.ComponentType.ROW, components: c }));
        }
    }
    static normalizeFindAndResolveSmartEmbed(data, type) {
        if (type === const_2.InteractionCallbackType.PONG)
            return;
        if (type === const_2.InteractionCallbackType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT)
            return;
        if (type === const_2.InteractionCallbackType.MODAL)
            return;
        if (!data.content)
            data.content = '';
        if (!data.description && !data.title)
            return;
        if (!data.embeds)
            data.embeds = [];
        data.embeds.push({
            title: data.title || undefined,
            description: data.description || undefined,
            footer: data.footer ? { text: data.footer } : undefined,
            image: data.image ? { url: data.image } : undefined,
            thumbnail: data.thumbnail ? { url: data.thumbnail } : undefined,
            color: data.color || 0x2F3136
        });
        delete data.description;
        delete data.title;
    }
    //
    static compileCustomId(customId, flags, contextId) {
        return `${contextId ?? ''}::${customId}:${flags?.join('') ?? ''}`;
    }
    static parseCustomId(rawId) {
        const [contextId, _reserved, customId, flagsRaw] = rawId.split(':');
        return { contextId, _reserved, customId, flagsRaw };
    }
}
exports.default = CordoAPI;
//# sourceMappingURL=api.js.map