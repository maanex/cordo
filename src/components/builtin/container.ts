import { ComponentType, createComponent, renderComponentList, type CordoComponent } from "../component"


type AllowedComponents = CordoComponent<'ActionRow' | 'Button' | 'TextDisplay' | 'Section' | 'MediaGallery' | 'Seperator' | 'File' | 'StringSelect'>
type AllowedComponentArray = AllowedComponents[]

export function container(...components: AllowedComponentArray) {
  let accentColor: string | number | undefined = undefined
  let spoiler: boolean | undefined = undefined

  const out = {
    ...createComponent('Container', ({ hirarchy }) => ({
      type: ComponentType.Container,
      components: renderComponentList(components, 'Container', hirarchy),
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
