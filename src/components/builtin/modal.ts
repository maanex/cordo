import { Hooks } from "../../core/hooks"
import { CordoMagic } from "../../core/magic"
import type { CordoFunct, CordoFunctRun } from "../../functions"
import { FunctCompiler } from "../../functions/compiler"
import { ComponentType, createComponent, renderComponent, renderComponentList, type CordoComponent, type CordoComponentPayload, type StringComponentType } from "../component"
import type { CordoModifier } from "../modifier"


export type AllowedComponents = CordoComponent<'TextDisplay' | 'TextInput' | 'RoleSelect' | 'UserSelect' | 'StringSelect' | 'ChannelSelect' | 'MentionableSelect' | 'Label' | 'FileUpload' | 'RadioGroup' | 'CheckboxGroup' | 'Checkbox'> | CordoModifier
type AllowedComponentArray = Array<AllowedComponents | AllowedComponents[]>

const componentsRequiringLabel: StringComponentType[] = [ 'TextInput', 'RoleSelect', 'UserSelect', 'StringSelect', 'ChannelSelect', 'MentionableSelect', 'FileUpload', 'RadioGroup', 'CheckboxGroup', 'Checkbox' ]
function labelize(component: CordoComponent<StringComponentType>, parsed: CordoComponentPayload<StringComponentType>): CordoComponent<StringComponentType> | null {
  if (!parsed.visible)
    return null

  if (!componentsRequiringLabel.includes(parsed.nativeName))
    return component

  return createComponent('Label', ({ attributes, hirarchy }) => {
    const rendered = renderComponent(component, 'Modal', hirarchy, attributes)
    return {
      type: ComponentType.Label,
      label: rendered?.['modal:label'] ?? parsed.nativeName,
      id: rendered?.['modal:id'],
      description: rendered?.['modal:description'],
      component: {
        ...rendered,
        'modal:label': undefined,
        'modal:id': undefined,
        'modal:description': undefined
      }
    }
  })
}

export function modal(...components: AllowedComponentArray) {
  let titleVal: string | undefined = undefined
  const functVal: CordoFunct[] = []
  let overrideCustomIdVal: string | undefined = undefined

  function getTitle() {
    if (!titleVal) {
      if (!CordoMagic.getConfig()?.omitWarnings.includes('placeholderTextAppearance'))
        console.warn('A modal was rendered without a title provided. Cordo will use a placeholder title.')
      return 'Modal'
    }

    return Hooks.callHook(
      'transformUserFacingText',
      titleVal,
      { component: 'Modal', position: 'title' }
    )
  }

  const advanced = {
    /** Will override cordo's custom_id generation. Not compatible with onSubmit handlers */
    overrideCustomId(customId: string) {
      if (functVal.length > 0 && !CordoMagic.getConfig()?.omitWarnings.includes('customIdOverride'))
        console.warn('You are overriding the custom_id of a modal that has onSubmit handlers. This will prevent the onSubmit handlers from working.')
      overrideCustomIdVal = customId
      return out
    }
  }

  const out = {
    ...createComponent('Modal', ({ hirarchy, attributes }) => ({
      type: ComponentType.Modal,
      components: renderComponentList(components.flat(), 'Modal', hirarchy, attributes, labelize),
      title: getTitle(),
      custom_id: overrideCustomIdVal ?? FunctCompiler.toCustomId(functVal)
    })),

    title: (value: string) => {
      titleVal = value
      return out
    },
    onSubmit: (...funct: CordoFunctRun) => {
      if (overrideCustomIdVal && !CordoMagic.getConfig()?.omitWarnings.includes('customIdOverride'))
        console.warn('You are adding onSubmit handlers to a modal that already has an overridden custom_id. These handlers will not be called.')
      functVal.push(...funct)
      return out
    },
    *[Symbol.iterator]() {
      for (const component of components) {
        if (Array.isArray(component))
          yield* component
        else
          yield component
      }
    },
    /** This namespace contains advanced features you normally do not need */
    advanced
  }

  return out
}
