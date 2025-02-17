import { ComponentType, createComponent, renderComponentList, type CordoComponent } from "../component"


export function gallery(...items: CordoComponent<'Thumbnail'>[]) {
  const out = {
    ...createComponent('MediaGallery', ({ }) => ({
      type: ComponentType.MediaGallery,
      items: renderComponentList(items, 'MediaGallery')
    })),
  }

  return out
}
