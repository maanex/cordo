"use strict";
/*
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSlot = exports.zipArrays = void 0;
function zipArrays(a, b) {
    return a.map((e, i) => ([e, b[i]]));
}
exports.zipArrays = zipArrays;
/*
 *
 */
function parseSlot(template, value) {
    return zipArrays(template.split('_'), value.split('_'))
        .filter(e => e[0].startsWith('$'))
        .map(e => ([e[0].substr(1), e[1]]))
        .reduce((o, e) => ({ ...o, [e[0]]: e[1] }), {});
}
exports.parseSlot = parseSlot;
//# sourceMappingURL=utils.js.map