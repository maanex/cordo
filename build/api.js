"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const permission_strings_1 = require("./lib/permission-strings");
const const_1 = require("./types/const");
const index_1 = require("./index");
class CordoAPI {
    static interactionCallback(i, type, data) {
        CordoAPI.normaliseData(data, i);
        if (!i._answered) {
            i._answered = true;
            axios_1.default
                .post(`https://discord.com/api/v8/interactions/${i.id}/${i.token}/callback`, { type, data }, { validateStatus: null })
                .then((res) => {
                if (res.status >= 300) {
                    index_1.default._data.logger.warn('Interaction callback failed with error:');
                    index_1.default._data.logger.warn(JSON.stringify(res.data, null, 2));
                    index_1.default._data.logger.warn('Request payload:');
                    index_1.default._data.logger.warn(JSON.stringify({ type, data }, null, 2));
                }
            });
            return;
        }
        switch (type) {
            case const_1.InteractionCallbackType.PONG: break;
            case const_1.InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: break;
            case const_1.InteractionCallbackType.DEFERRED_UPDATE_MESSAGE: break;
            case const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE:
                axios_1.default.post(`https://discord.com/api/v8/webhooks/${index_1.default._data.config.botId}/${i.token}`, data);
                break;
            case const_1.InteractionCallbackType.UPDATE_MESSAGE:
                axios_1.default.patch(`https://discord.com/api/v8/webhooks/${index_1.default._data.config.botId}/${i.token}/messages/@original`, data);
                break;
        }
    }
    /**
     * Transforms the shorthand way of writing into proper discord api compatible objects
     */
    static normaliseData(data, i) {
        if (!data)
            return;
        // explicitly not using this. in this function due to unwanted side-effects in lambda functions
        index_1.default._data.middlewares.interactionCallback.forEach(f => f(data, i.guildData));
        if (!data.content)
            data.content = '';
        if (data.description || data.title) {
            if (!data.embeds)
                data.embeds = [];
            data.embeds.push({
                title: data.title || undefined,
                description: data.description || undefined,
                footer: data.footer ? { text: data.footer } : undefined,
                thumbnail: data.image ? { url: data.image } : undefined,
                color: data.color || 0x2F3136
            });
            delete data.description;
            delete data.title;
        }
        if (data.components?.length && data.components[0].type !== const_1.ComponentType.ROW) {
            const rows = [];
            let newlineFlag = true;
            for (const comp of data.components) {
                if (comp.type !== const_1.ComponentType.LINE_BREAK && comp.flags?.length && !!comp.custom_id) {
                    comp.custom_id += `-${comp.flags.join('')}`;
                    if (!!i.member && !comp.flags.includes(const_1.InteractionComponentFlag.ACCESS_EVERYONE)) {
                        const perms = BigInt(i.member.permissions);
                        if (comp.flags.includes(const_1.InteractionComponentFlag.ACCESS_ADMIN) && !permission_strings_1.default.containsAdmin(perms)) {
                            if (comp.flags.includes(const_1.InteractionComponentFlag.HIDE_IF_NOT_ALLOWED))
                                comp.type = null;
                            else
                                comp.disabled = true;
                        }
                        else if (comp.flags.includes(const_1.InteractionComponentFlag.ACCESS_MANAGE_SERVER) && !permission_strings_1.default.containsManageServer(perms)) {
                            if (comp.flags.includes(const_1.InteractionComponentFlag.HIDE_IF_NOT_ALLOWED))
                                comp.type = null;
                            else
                                comp.disabled = true;
                        }
                        else if (comp.flags.includes(const_1.InteractionComponentFlag.ACCESS_MANAGE_MESSAGES) && !permission_strings_1.default.containsManageMessages(perms)) {
                            if (comp.flags.includes(const_1.InteractionComponentFlag.HIDE_IF_NOT_ALLOWED))
                                comp.type = null;
                            else
                                comp.disabled = true;
                        }
                        else if (comp.flags.includes(const_1.InteractionComponentFlag.ACCESS_BOT_ADMIN) && !index_1.default._data.isBotOwner(i.user.id)) {
                            if (comp.flags.includes(const_1.InteractionComponentFlag.HIDE_IF_NOT_ALLOWED))
                                comp.type = null;
                            else
                                comp.disabled = true;
                        }
                    }
                    delete comp.flags;
                }
                switch (comp.type) {
                    case const_1.ComponentType.LINE_BREAK: {
                        if (rows[rows.length - 1].length)
                            newlineFlag = true;
                        break;
                    }
                    case const_1.ComponentType.BUTTON: {
                        if (newlineFlag)
                            rows.push([]);
                        newlineFlag = false;
                        if (comp.label?.length > 25)
                            comp.label = comp.label.substr(0, 25);
                        rows[rows.length - 1].push(comp);
                        if (rows[rows.length - 1].length >= 5)
                            newlineFlag = true;
                        break;
                    }
                    case const_1.ComponentType.SELECT: {
                        if (comp.options?.length > 25)
                            comp.options.length = 25;
                        rows.push([comp]);
                        newlineFlag = true;
                    }
                }
            }
            data.components = rows.map(c => ({ type: const_1.ComponentType.ROW, components: c }));
        }
    }
}
exports.default = CordoAPI;
//# sourceMappingURL=api.js.map