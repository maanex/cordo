"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_interactions_1 = require("discord-interactions");
const __1 = require("..");
const api_1 = require("../api");
const const_1 = require("../types/const");
class UserErrorMessages {
    static interactionNotPermitted(i, text) {
        return api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, {
            title: __1.default._data.config.texts.interaction_not_permitted_title,
            description: text || __1.default._data.config.texts.interaction_not_permitted_description_generic,
            flags: discord_interactions_1.InteractionResponseFlags.EPHEMERAL
        });
    }
    static interactionNotOwned(i, command, owner) {
        return api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, {
            title: __1.default._data.config.texts.interaction_not_owned_title,
            description: __1.default._data.config.texts.interaction_not_owned_description,
            flags: discord_interactions_1.InteractionResponseFlags.EPHEMERAL,
            _context: { command, owner }
        });
    }
    static interactionInvalid(i, text, command) {
        return api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, {
            title: __1.default._data.config.texts.interaction_invalid_title,
            description: __1.default._data.config.texts.interaction_invalid_description,
            flags: discord_interactions_1.InteractionResponseFlags.EPHEMERAL,
            _context: { text, command }
        });
    }
    static interactionFailed(i) {
        return api_1.default.interactionCallback(i, const_1.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, {
            content: __1.default._data.config.texts.interaction_failed,
            flags: discord_interactions_1.InteractionResponseFlags.EPHEMERAL
        });
    }
}
exports.default = UserErrorMessages;
//# sourceMappingURL=user-error-messages.js.map