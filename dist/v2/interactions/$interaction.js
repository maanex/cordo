"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseInteraction = void 0;
const const_1 = require("../types/const");
const autocomplete_interaction_1 = require("./autocomplete-interaction");
const command_interaction_1 = require("./command-interaction");
const component_interaction_1 = require("./component-interaction");
const modal_submit_interaction_1 = require("./modal-submit-interaction");
//
function parseInteraction(input) {
    const dataParsers = {
        [const_1.Const.InteractionType.PING]: null,
        [const_1.Const.InteractionType.COMMAND]: command_interaction_1.parseCommandInteractionData,
        [const_1.Const.InteractionType.COMPONENT]: component_interaction_1.parseComponentInteractionData,
        [const_1.Const.InteractionType.COMMAND_AUTOCOMPLETE]: autocomplete_interaction_1.parseAutocompleteInteractionData,
        [const_1.Const.InteractionType.MODAL_SUBMIT]: modal_submit_interaction_1.parseModalSubmitInteractionData
    };
    const data = dataParsers[input.type]?.() ?? undefined;
    return {
        type: input.type,
        data,
        id: input.id,
        applicationId: input.application_id,
        version: input.version,
        token: input.token,
        user: input.user ?? input.member?.user,
        userLocale: input.locale ?? 'en-US',
        guildMember: input.member,
        guildLocale: input.guild_locale,
        guildData: null,
        userData: null,
        params: {}
    };
}
exports.parseInteraction = parseInteraction;
//# sourceMappingURL=$interaction.js.map