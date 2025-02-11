import { ComponentType, createComponent, readComponent, type CordoComponent } from "../component"


type AllowedComponentsContent = CordoComponent<'TextDisplay'>
type AllowedComponentsAccessory = CordoComponent<'Thumbnail' | 'Button'>

export function section(...components: AllowedComponentsContent[]) {
  let accessory: AllowedComponentsAccessory | undefined = undefined

  const out = {
    ...createComponent('Section', () => ({
      type: ComponentType.Section,
      components: components.map(c => readComponent(c).render()),
      accessory: accessory ? readComponent(accessory).render() : undefined
    })),

    decorate(component: AllowedComponentsAccessory) {
      accessory = component
      return out
    }
  }

  return out
}
