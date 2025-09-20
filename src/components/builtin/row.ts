import { ComponentType, createComponent, renderComponentList, type CordoComponent } from "../component"


type AllowedComponents = CordoComponent<'Button' | 'StringSelect'>
type AllowedComponentArray
  = [ AllowedComponents ]
  | [ AllowedComponents, AllowedComponents ]
  | [ AllowedComponents, AllowedComponents, AllowedComponents ]
  | [ AllowedComponents, AllowedComponents, AllowedComponents, AllowedComponents ]
  | [ AllowedComponents, AllowedComponents, AllowedComponents, AllowedComponents, AllowedComponents ]

export function row(...components: AllowedComponentArray | [ AllowedComponentArray ]) {
  if (Array.isArray(components[0]))
    components = components[0]

  return createComponent('ActionRow', ({ hirarchy, attributes }) => {
    const rendered = renderComponentList(components as AllowedComponentArray, 'ActionRow', hirarchy, attributes)
      .filter(Boolean)
    if (!rendered.length)
      return null

    return {
      type: ComponentType.ActionRow,
      components: rendered
    }
  })
}
