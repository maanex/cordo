import { ComponentType, createComponent, readComponent, type CordoComponent } from "../component"


type AllowedComponents = CordoComponent<'Button'>
type AllowedComponentArray
  = [ AllowedComponents ]
  | [ AllowedComponents, AllowedComponents ]
  | [ AllowedComponents, AllowedComponents, AllowedComponents ]
  | [ AllowedComponents, AllowedComponents, AllowedComponents, AllowedComponents ]
  | [ AllowedComponents, AllowedComponents, AllowedComponents, AllowedComponents, AllowedComponents ]

export function row(...components: AllowedComponentArray) {
  return createComponent('ActionRow', () => ({
    type: ComponentType.ActionRow,
    components: components.map(c => readComponent(c).render())
  }))
}
