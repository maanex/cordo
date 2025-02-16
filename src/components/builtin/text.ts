import { ComponentType, createComponent } from "../component"


export function text(...content: Array<string | { toString: () => string }>) {
  let sizePrefix: string = ''
  let innerPrefix: string = ''
  let innerSuffix: string = ''
  let linkUrl: string | null = null

  function toString(): string {
    const stringContent = content.map(c => typeof c === 'string' ? c : c.toString())
    const innerContent = (innerPrefix ?? '') + stringContent.join(' ') + (innerSuffix ?? '')
    const outerContent = linkUrl
      ? `[${innerContent}](${linkUrl})`
      : innerContent
    return sizePrefix + outerContent as string
  }

  const out = {
    ...createComponent('TextDisplay', () => ({
      type: ComponentType.TextDisplay,
      content: toString()
    })),

    toString,

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
    },

    bold: (val = true) => {
      if (val) {
        innerPrefix = innerPrefix + '**'
        innerSuffix = '**' + innerSuffix
      }
      return out
    },
    italic: (val = true) => {
      if (val) {
        innerPrefix = innerPrefix + '*'
        innerSuffix = '*' + innerSuffix
      }
      return out
    },
    underline: (val = true) => {
      if (val) {
        innerPrefix = innerPrefix + '__'
        innerSuffix = '__' + innerSuffix
      }
      return out
    },
    strike: (val = true) => {
      if (val) {
        innerPrefix = innerPrefix + '~~'
        innerSuffix = '~~' + innerSuffix
      }
      return out
    },
    code: (val = true) => {
      if (val) {
        innerPrefix = innerPrefix + '`'
        innerSuffix = '`' + innerSuffix
      }
      return out
    },
    codeBlock: (language = '', val = true) => {
      if (val) {
        innerPrefix = innerPrefix + '```' + (language ? language + '\n' : '')
        innerSuffix = '```' + innerSuffix
      }
      return out
    },
  }
  
  return out
}
