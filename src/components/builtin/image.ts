import { ComponentType, createComponent } from "../component"


export function image(url: string) {
  let description: string | undefined = undefined
  let spoiler: boolean | undefined = undefined

  const out = {
    ...createComponent('Thumbnail', ({ }) => ({
      type: ComponentType.Thumbnail,
      media: {
        url
      },
      spoiler,
      description
    })),

    description: (value: string) => {
      description = value
      return out
    },
    spoiler: (value: boolean = true) => {
      spoiler = value
      return out
    }
  }

  return out
}
