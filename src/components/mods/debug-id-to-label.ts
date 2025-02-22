import { ComponentType } from "../component"
import { createModifier } from "../modifier"


function searchForButton(c: any): any {
  if (!c) return c
  if (Array.isArray(c)) return c.map(searchForButton)
  if (typeof c !== 'object') return c
  if (c.type === ComponentType.Button && 'custom_id' in c) {
    c.label = c.custom_id
    return c
  }
  for (const key of Object.keys(c))
    c[key] = searchForButton(c[key])
  return c
}

export function debugIdToLabel() {
  return createModifier({
    name: 'debug-id-to-label',
    hooks: {
      postRender: (c) => {
        searchForButton(c)
        return c
      }
    }
  })
}
