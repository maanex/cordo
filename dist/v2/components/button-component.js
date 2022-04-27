"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.button = void 0;
const const_1 = require("../../types/const");
const api_1 = require("../api");
const const_2 = require("../types/const");
/*
 *
 *
 *
 */
function withOptions([options]) {
    return {
        customId: options.customId ?? null,
        doRender: !!options.visible,
        serialize: (context) => ({
            type: const_1.ComponentType.BUTTON,
            label: options.label ?? undefined,
            emoji: options.emoji ?? undefined,
            disabled: options.disabled ?? undefined,
            style: parseButtonStyle(options.style, !!options.customId),
            url: options.url ?? undefined,
            custom_id: generateCustomId(options.customId, options.flags, context)
        })
    };
}
function withUrl([url, rawLabel, disabled]) {
    const [emoji, label] = parseInlineLabel(rawLabel);
    return {
        customId: undefined,
        doRender: true,
        serialize: () => ({
            type: const_1.ComponentType.BUTTON,
            label,
            emoji,
            disabled,
            style: const_2.Const.ButtonStyle.LINK,
            url,
            custom_id: undefined
        })
    };
}
function withCustomId([customId, rawLabel, style, disabled, rawFlags]) {
    const [emoji, label] = parseInlineLabel(rawLabel);
    const flags = (typeof rawFlags === 'string')
        ? [rawFlags]
        : rawFlags;
    return {
        customId,
        doRender: true,
        serialize: (context) => ({
            type: const_1.ComponentType.BUTTON,
            label,
            emoji,
            disabled,
            style: parseButtonStyle(style, true),
            url: undefined,
            custom_id: generateCustomId(customId, flags, context)
        })
    };
}
function button(...args) {
    if (args.length === 1)
        return withOptions(args);
    return withCustomId(args);
}
exports.button = button;
button.link = function (url, label, disabled) {
    return withUrl([url, label, disabled]);
};
//
function parseButtonStyle(style, hasCustomId) {
    switch (style) {
        case 'PRIMARY':
        case 'BLUE':
            return const_2.Const.ButtonStyle.PRIMARY;
        case 'SECONDARY':
        case 'GRAY':
        case 'GREY':
            return const_2.Const.ButtonStyle.SECONDARY;
        case 'SUCCESS':
        case 'GREEN':
            return const_2.Const.ButtonStyle.SUCCESS;
        case 'DANGER':
        case 'RED':
            return const_2.Const.ButtonStyle.DANGER;
        default:
            return hasCustomId
                ? const_2.Const.ButtonStyle.SECONDARY
                : const_2.Const.ButtonStyle.LINK;
    }
}
function parseInlineLabel(label) {
    if (typeof label === 'string')
        return [undefined, label];
    if (typeof label === 'object' && ('push' in label))
        return label;
    return [label, undefined];
}
function generateCustomId(customId, flags, context) {
    if (!customId)
        return undefined;
    return api_1.default.compileCustomId(customId, flags, context.id);
}
//# sourceMappingURL=button-component.js.map