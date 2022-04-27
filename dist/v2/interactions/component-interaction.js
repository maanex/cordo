"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseComponentInteractionData = void 0;
//
function parseComponentInteractionData(data) {
    return {
        customId: data.custom_id,
        type: data.component_type,
        values: data.values
    };
}
exports.parseComponentInteractionData = parseComponentInteractionData;
//# sourceMappingURL=component-interaction.js.map