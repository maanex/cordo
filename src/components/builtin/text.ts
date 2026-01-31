import { Hooks } from "../../core/hooks"
import { ComponentType, createComponent } from "../component"


export function text(...content: Array<string | { toString: () => string }>) {
  let outerPrefix: string = ''
  let innerPrefix: string = ''
  let innerSuffix: string = ''
  let linkUrl: string | null = null

  function toString(attributes: Record<string, any> = {}): string {
    const stringContent = content
      .map(c => String(c))
      .map(c => Hooks.callHook('transformUserFacingText', c, { ...attributes, component: 'TextDisplay', position: null }))
    const innerContent = (innerPrefix ?? '') + stringContent.join(' ').replace(/^ +| +$/mg, '') + (innerSuffix ?? '')
    const outerContent = linkUrl
      ? `[${innerContent}](${linkUrl})`
      : innerContent
    return outerPrefix + outerContent as string
  }

  const out = {
    ...createComponent('TextDisplay', ({ attributes }) => ({
      type: ComponentType.TextDisplay,
      content: toString(attributes)
    })),

    toString,

    size: (size: 'h1' | 'h2' | 'h3' | 'small' | 'default') => {
      if (size === 'h1') outerPrefix = '# '
      else if (size === 'h2') outerPrefix = '## '
      else if (size === 'h3') outerPrefix = '### '
      else if (size === 'small') outerPrefix = '-# '
      else outerPrefix = ''
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
    quote: (val = true) => {
      if (val)
        outerPrefix = '> '
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
    }
  }
  
  return out
}
