import { ComponentType, createComponent, renderComponent, renderComponentList, type CordoComponent } from "../component"


type AllowedComponentsContent = CordoComponent<'TextDisplay'>
type AllowedComponentsAccessory = CordoComponent<'Thumbnail' | 'Button'>

export function section(...components: AllowedComponentsContent[]) {
  let accessory: AllowedComponentsAccessory | undefined = undefined

  const out = {
    ...createComponent('Section', ({ hirarchy }) => ({
      type: ComponentType.Section,
      components: renderComponentList(components, 'Section', hirarchy),
      accessory: accessory ? renderComponent(accessory, 'Section', hirarchy) : undefined
    })),

    decorate(component: AllowedComponentsAccessory) {
      accessory = component
      return out
    }
  }

  return out
}
