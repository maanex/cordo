import { ComponentType, createComponent } from "../component"


export function divider() {
  let spacing: number | undefined = undefined

  const out = {
    ...createComponent('Seperator', () => ({
      type: ComponentType.Seperator,
      spacing,
      divider: true
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
