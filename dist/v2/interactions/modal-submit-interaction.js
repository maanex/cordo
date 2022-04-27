"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseModalSubmitInteractionData = void 0;
//
function parseModalSubmitInteractionData(data) {
    const components = {};
    for (const comp of data.components) {
        if (!comp.custom_id)
            continue;
        components[comp.custom_id] = comp.options ?? comp.value;
    }
    return {
        components
    };
}
exports.parseModalSubmitInteractionData = parseModalSubmitInteractionData;
//# sourceMappingURL=modal-submit-interaction.js.map