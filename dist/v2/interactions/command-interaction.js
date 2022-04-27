"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCommandInteractionData = void 0;
const const_1 = require("../types/const");
//
function parseCommandInteractionData(data) {
    let target = undefined;
    if (data.type === const_1.Const.InteractionCommandType.MESSAGE)
        target = data.resolved?.messages?.[data.target_id];
    else if (data.type === const_1.Const.InteractionCommandType.USER)
        target = data.resolved?.users?.[data.target_id];
    const options = {};
    for (const opt of data.options)
        options[opt.name] = opt;
    return {
        id: data.id,
        name: data.name,
        type: data.type,
        resolved: data.resolved ?? {},
        targetId: data.target_id,
        target,
        options
    };
}
exports.parseCommandInteractionData = parseCommandInteractionData;
//# sourceMappingURL=command-interaction.js.map