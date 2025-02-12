import { createModifier } from "../modifier"


export function debugPrint() {
  return createModifier({
    name: 'debug-print',
    hooks: {
      postRender: (c) => {
        console.log(JSON.stringify(c, null, 2))
        return c
      }
    }
  })
}
