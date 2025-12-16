import { ComponentType } from "../component"
import { createModifier } from "../modifier"


const disableableComponents = [
  ComponentType.Button,
  ComponentType.StringSelect,
  ComponentType.UserSelect,
  ComponentType.RoleSelect,
  ComponentType.MentionableSelect,
  ComponentType.ChannelSelect
]

function iterateComponents(c: any): any {
  if (!c) return c
  if (Array.isArray(c)) return c.map(iterateComponents)
  if (typeof c !== 'object') return c
  if (disableableComponents.includes(c.type)) {
    c.disabled = true
    return c
  }
  for (const key of Object.keys(c))
    c[key] = iterateComponents(c[key])
  return c
}

export function disableAllComponents(disable = true) {
  return createModifier({
    name: 'disable-all-components',
    hooks: {
      afterRender: (c) => {
        if (disable)
          iterateComponents(c)
        return c
      }
    }
  })
}
