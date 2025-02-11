import { ComponentType, createComponent } from "../component"


export function spacer() {
  let spacing: number | undefined = undefined

  const out = {
    ...createComponent('Seperator', () => ({
      type: ComponentType.Seperator,
      spacing,
      divider: false
    })),

    size: (size: 'small' | 'large') => {
      spacing = (size === 'small')
        ? 1
        : (size === 'large')
          ? 2
          : undefined
      return out
    }
  }
  
  return out
}
