/*
 *
 */
export function zipArrays(a, b) {
    return a.map((e, i) => ([e, b[i]]));
}
/*
 *
 */
export function parseParams(template, value) {
    return zipArrays(template.split('_'), value.split('_'))
        .filter(e => e[0].startsWith('$'))
        .map(e => ([e[0].substring(1), e[1]]))
        .reduce((o, e) => ({ ...o, [e[0]]: e[1] }), {});
}
//# sourceMappingURL=utils.js.map