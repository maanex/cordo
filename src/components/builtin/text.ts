import { ComponentType, createComponent } from "../component"


export function text(content: string) {
  let sizePrefix: string = ''

  const out = {
    ...createComponent('TextDisplay', () => ({
      type: ComponentType.TextDisplay,
      content: sizePrefix + content
    })),

    size: (size: 'h1' | 'h2' | 'h3' | 'small' | 'default') => {
      if (size === 'h1') sizePrefix = '# '
      else if (size === 'h2') sizePrefix = '## '
      else if (size === 'h3') sizePrefix = '### '
      else if (size === 'small') sizePrefix = '-# '
      else sizePrefix = ''
      return out
    }
  }
  
  return out
}
