"use strict";
/*
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseParams = exports.zipArrays = void 0;
function zipArrays(a, b) {
    return a.map((e, i) => ([e, b[i]]));
}
exports.zipArrays = zipArrays;
/*
 *
 */
function parseParams(template, value) {
    return zipArrays(template.split('_'), value.split('_'))
        .filter(e => e[0].startsWith('$'))
        .map(e => ([e[0].substr(1), e[1]]))
        .reduce((o, e) => ({ ...o, [e[0]]: e[1] }), {});
}
exports.parseParams = parseParams;
//# sourceMappingURL=utils.js.map