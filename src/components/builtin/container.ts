import { ComponentType, createComponent, readComponent, type CordoComponent } from "../component"


type AllowedComponents = CordoComponent<'ActionRow' | 'TextDisplay' | 'Section' | 'MediaGallery' | 'Seperator' | 'File'>
type AllowedComponentArray
  = [ AllowedComponents ]
  | [ AllowedComponents, AllowedComponents ]
  | [ AllowedComponents, AllowedComponents, AllowedComponents ]
  | [ AllowedComponents, AllowedComponents, AllowedComponents, AllowedComponents ]
  | [ AllowedComponents, AllowedComponents, AllowedComponents, AllowedComponents, AllowedComponents ]

export function container(...components: AllowedComponentArray) {
  let accentColor: string | number | undefined = undefined
  let spoiler: boolean | undefined = undefined

  const out = {
    ...createComponent('Container', () => ({
      type: ComponentType.Container,
      components: components.map(c => readComponent(c).render()),
      accent_color: typeof accentColor === 'string' ? parseInt(accentColor.slice(1), 16) : accentColor,
      spoiler
    })),

    accentColor: (color: string | number) => {
      accentColor = color
      return out
    },
    spoiler: (value: boolean = true) => {
      spoiler = value
      return out
    }
  }

  return out
}
