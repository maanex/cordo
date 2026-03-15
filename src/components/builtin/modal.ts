import { Hooks } from "../../core/hooks"
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

  function getTitle() {
    if (!titleVal)
      return 'Modal'

    return Hooks.callHook(
      'transformUserFacingText',
      titleVal,
      { component: 'Modal', position: 'title' }
    )
  }

  const out = {
    ...createComponent('Modal', ({ hirarchy, attributes }) => ({
      type: ComponentType.Modal,
      components: renderComponentList(components.flat(), 'Modal', hirarchy, attributes, labelize),
      title: getTitle(),
      custom_id: FunctCompiler.toCustomId(functVal)
    })),

    title: (value: string) => {
      titleVal = value
      return out
    },
    onSubmit: (...funct: CordoFunctRun) => {
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
    }
  }

  return out
}
