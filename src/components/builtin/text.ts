import { ComponentType, createComponent } from "../component"


export function text(...content: string[]) {
  let sizePrefix: string = ''
  let linkUrl: string | null = null

  const out = {
    ...createComponent('TextDisplay', () => {
      const innerContent = linkUrl
        ? `[${content.join(' ')}](${linkUrl})`
        : content.join(' ')
      return {
        type: ComponentType.TextDisplay,
        content: sizePrefix + innerContent
      }
    }),

    size: (size: 'h1' | 'h2' | 'h3' | 'small' | 'default') => {
      if (size === 'h1') sizePrefix = '# '
      else if (size === 'h2') sizePrefix = '## '
      else if (size === 'h3') sizePrefix = '### '
      else if (size === 'small') sizePrefix = '-# '
      else sizePrefix = ''
      return out
    },

    link: (url: string) => {
      linkUrl = url
      return out
    }
  }
  
  return out
}
