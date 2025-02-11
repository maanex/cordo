import { ComponentType, createComponent } from "../component"


export function text(content: string) {
  let sizePrefix: string = ''

  const out = {
    ...createComponent('TextDisplay', () => ({
      type: ComponentType.TextDisplay,
      content: sizePrefix + content
    })),

    size: (size: 'h1' | 'h2' | 'h3' | 'small' | 'default') => {
      sizePrefix = (size === 'h1')
        ? '# '
        : (size === 'h2')
          ? '## '
          : (size === 'h3')
            ? '### '
            : (size === 'small')
              ? '-# '
              : ''
      return out
    }
  }
  
  return out
}
