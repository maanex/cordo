import { InteractionResponseFlags } from "discord-interactions";
import Cordo from "..";
import CordoAPI from "../api";
import { InteractionCallbackType } from "../types/const";
export default class UserErrorMessages {
    static interactionNotPermitted(i, text) {
        return CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, {
            title: Cordo._data.config.texts.interaction_not_permitted_title,
            description: text || Cordo._data.config.texts.interaction_not_permitted_description_generic,
            flags: InteractionResponseFlags.EPHEMERAL
        });
    }
    static interactionNotOwned(i, command, owner) {
        return CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, {
            title: Cordo._data.config.texts.interaction_not_owned_title,
            description: Cordo._data.config.texts.interaction_not_owned_description,
            flags: InteractionResponseFlags.EPHEMERAL,
            _context: { command, owner }
        });
    }
    static interactionInvalid(i, text, command) {
        return CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, {
            title: Cordo._data.config.texts.interaction_invalid_title,
            description: Cordo._data.config.texts.interaction_invalid_description,
            flags: InteractionResponseFlags.EPHEMERAL,
            _context: { text, command }
        });
    }
    static interactionFailed(i) {
        return CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, {
            content: Cordo._data.config.texts.interaction_failed,
            flags: InteractionResponseFlags.EPHEMERAL
        });
    }
}
//# sourceMappingURL=user-error-messages.js.map