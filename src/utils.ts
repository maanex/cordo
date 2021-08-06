

/*
 *
 */

export function zipArrays<A, B>(a: Array<A>, b: Array<B>): Array<[A, B]> {
  return a.map((e, i) => ([ e, b[i] ]))
}


/*
 *
 */

export function parseParams(template: string, value: string): Record<string, string> {
  return zipArrays(template.split('_'), value.split('_'))
    .filter(e => e[0].startsWith('$'))
    .map(e => ([ e[0].substr(1), e[1] ]))
    .reduce((o, e) => ({ ...o, [ e[0] ]: e[1] }), {})
}
