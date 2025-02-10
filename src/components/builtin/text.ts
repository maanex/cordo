import { ComponentType, createComponent, type CordoComponent } from "../component"


export function text(content: string): CordoComponent<'TextDisplay'> {
  return createComponent('TextDisplay', () => ({
    type: ComponentType.TextDisplay,
    content
  }))
}
