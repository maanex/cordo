import axios from 'axios';
import PermissionStrings from './lib/permission-strings';
import { InteractionResponseFlags } from './types/const';
import { ComponentType, InteractionCallbackType, InteractionComponentFlag } from './types/const';
import PermissionChecks from './lib/permission-checks';
import Cordo from './index';
export default class CordoAPI {
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
                const res = await axios.post(`https://discord.com/api/v9/interactions/${i.id}/${i.token}/callback`, { type, data }, { validateStatus: null });
                CordoAPI.handleCallbackResponse(res, type, data);
            }
        }
        else {
            switch (type) {
                case InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE: {
                    const res = await axios.post(`https://discord.com/api/v9/webhooks/${Cordo._data.config.botId}/${i.token}`, data, { validateStatus: null });
                    CordoAPI.handleCallbackResponse(res, type, data);
                    break;
                }
                case InteractionCallbackType.UPDATE_MESSAGE: {
                    const res = await axios.patch(`https://discord.com/api/v9/webhooks/${Cordo._data.config.botId}/${i.token}/messages/@original`, data, { validateStatus: null });
                    CordoAPI.handleCallbackResponse(res, type, data);
                    break;
                }
            }
        }
        return {
            async getMessage() {
                const res = await axios.get(`https://discord.com/api/v8/webhooks/${Cordo._data.config.botId}/${i.token}/messages/@original`, { validateStatus: null });
                if (res.status !== 200)
                    return null;
                return res.data;
            },
            edit(editData, editUseRaw = useRaw) {
                CordoAPI.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, editData, contextId, editUseRaw);
            }
        };
    }
    static handleCallbackResponse(res, type, data) {
        if (Cordo._data.middlewares.apiResponseHandler) {
            Cordo._data.middlewares.apiResponseHandler(res);
        }
        else if (res.status >= 300) {
            Cordo._data.logger.warn('Interaction callback failed with error:');
            Cordo._data.logger.warn(JSON.stringify(res.data, null, 2));
            Cordo._data.logger.warn('Request payload:');
            Cordo._data.logger.warn(JSON.stringify({ type, data }, null, 2));
        }
    }
    /**
     * Transforms the shorthand way of writing into proper discord api compatible objects
     */
    static normaliseData(data, i, contextId, type) {
        if (!data)
            return;
        // explicitly not using this. in this function due to unwanted side-effects in lambda functions
        if (i)
            Cordo._data.middlewares.interactionCallback.forEach(f => f(data, i));
        CordoAPI.normalizeFindAndResolveSmartEmbed(data, type);
        const isEmphemeral = (data.flags & InteractionResponseFlags.EPHEMERAL) !== 0;
        if (data.components?.length && data.components[0].type !== ComponentType.ROW) {
            const rows = [];
            let newlineFlag = true;
            for (const comp of data.components) {
                if (comp.visible === false)
                    continue; // === false to not catch any null or undefined
                CordoAPI.normalizeApplyFlags(comp, i ?? null, contextId, isEmphemeral);
                switch (comp.type) {
                    case ComponentType.LINE_BREAK: {
                        if (rows[rows.length - 1].length)
                            newlineFlag = true;
                        break;
                    }
                    case ComponentType.BUTTON: {
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
                    case ComponentType.SELECT: {
                        if (comp.options?.length > 50)
                            comp.options.length = 50;
                        rows.push([comp]);
                        newlineFlag = true;
                        break;
                    }
                    case ComponentType.TEXT: {
                        rows.push([comp]);
                        newlineFlag = true;
                        break;
                    }
                    case ComponentType.USER_SELECT: {
                        rows.push([comp]);
                        newlineFlag = true;
                        break;
                    }
                    case ComponentType.ROLE_SELECT: {
                        rows.push([comp]);
                        newlineFlag = true;
                        break;
                    }
                    case ComponentType.MENTIONABLE_SELECT: {
                        rows.push([comp]);
                        newlineFlag = true;
                        break;
                    }
                    case ComponentType.CHANNEL_SELECT: {
                        rows.push([comp]);
                        newlineFlag = true;
                        break;
                    }
                }
            }
            data.components = rows.map(c => ({ type: ComponentType.ROW, components: c }));
        }
    }
    static normalizeFindAndResolveSmartEmbed(data, type) {
        if (type === InteractionCallbackType.PONG)
            return;
        if (type === InteractionCallbackType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT)
            return;
        if (type === InteractionCallbackType.MODAL)
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
            color: data.color || 0x2b2d31
        });
        delete data.description;
        delete data.title;
    }
    static normalizeApplyFlags(comp, i, contextId, isEmphemeral) {
        if (comp.type === ComponentType.LINE_BREAK)
            return;
        if (comp.type === ComponentType.TEXT)
            return;
        if (!comp.custom_id)
            return;
        const hasAccessEveryoneFlag = comp.flags?.includes(InteractionComponentFlag.ACCESS_EVERYONE);
        if (isEmphemeral && !hasAccessEveryoneFlag) {
            if (!comp.flags)
                comp.flags = [];
            comp.flags.push(InteractionComponentFlag.ACCESS_EVERYONE);
        }
        ;
        comp.custom_id = CordoAPI.compileCustomId(comp.custom_id, comp.flags, contextId);
        if (comp.flags?.length && i && !!i.member && !hasAccessEveryoneFlag) {
            const perms = BigInt(i.member.permissions);
            if (comp.flags.includes(InteractionComponentFlag.ACCESS_ADMIN) && !PermissionStrings.containsAdmin(perms)) {
                if (comp.flags.includes(InteractionComponentFlag.HIDE_IF_NOT_ALLOWED))
                    comp.type = null;
                else
                    comp.disabled = true;
            }
            else if (comp.flags.includes(InteractionComponentFlag.ACCESS_MANAGE_SERVER) && !PermissionStrings.containsManageServer(perms)) {
                if (comp.flags.includes(InteractionComponentFlag.HIDE_IF_NOT_ALLOWED))
                    comp.type = null;
                else
                    comp.disabled = true;
            }
            else if (comp.flags.includes(InteractionComponentFlag.ACCESS_MANAGE_MESSAGES) && !PermissionStrings.containsManageMessages(perms)) {
                if (comp.flags.includes(InteractionComponentFlag.HIDE_IF_NOT_ALLOWED))
                    comp.type = null;
                else
                    comp.disabled = true;
            }
            else if (comp.flags.includes(InteractionComponentFlag.ACCESS_BOT_ADMIN) && !PermissionChecks.isBotOwner(i.user.id)) {
                if (comp.flags.includes(InteractionComponentFlag.HIDE_IF_NOT_ALLOWED))
                    comp.type = null;
                else
                    comp.disabled = true;
            }
            delete comp.flags;
        }
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
//# sourceMappingURL=api.js.map