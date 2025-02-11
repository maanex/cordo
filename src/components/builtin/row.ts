import { ComponentType, createComponent, readComponent, type CordoComponent } from "../component"


type AllowedComponents = CordoComponent<'Button'>
type AllowedComponentArray
  = [ AllowedComponents ]
  | [ AllowedComponents, AllowedComponents ]
  | [ AllowedComponents, AllowedComponents, AllowedComponents ]
  | [ AllowedComponents, AllowedComponents, AllowedComponents, AllowedComponents ]
  | [ AllowedComponents, AllowedComponents, AllowedComponents, AllowedComponents, AllowedComponents ]

export function row(...components: AllowedComponentArray | [ AllowedComponentArray ]) {
  if (Array.isArray(components[0]))
    components = components[0]
  return createComponent('ActionRow', () => ({
    type: ComponentType.ActionRow,
    components: (components as AllowedComponentArray).map(c => readComponent(c).render())
  }))
}
