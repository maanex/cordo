import { row } from "./builtin/row"
import { readModifier, type CordoModifier } from "./modifier"


const CordoComponent = Symbol('CordoComponent')

export const ComponentType = {
  ActionRow: 1,
  Button: 2,
  StringSelect: 3,
  TextInput: 4,
  UserSelect: 5,
  RoleSelect: 6,
  MentionableSelect: 7,
  ChannelSelect: 8,
  Section: 9,
  TextDisplay: 10,
  Thumbnail: 11,
  MediaGallery: 12,
  File: 13,
  Seperator: 14,
  Container: 17
} as const
export type StringComponentType = keyof typeof ComponentType
export type ComponentIdFromName<Name extends StringComponentType> = typeof ComponentType[Name]

export type CordoComponent<Type extends StringComponentType> = {
  [CordoComponent]: {
    nativeName: Type
    nativeType: typeof ComponentType[Type]
    render: (meta: { hirarchy: Array<StringComponentType> }) => Record<string, any>
  }
}
export type CordoComponentPayload<Type extends StringComponentType> = CordoComponent<Type>[typeof CordoComponent]

export function createComponent<Type extends StringComponentType>(
  type: Type,
  render: CordoComponentPayload<Type>['render']
): CordoComponent<Type> {
  return {
    [CordoComponent]: {
      nativeName: type,
      nativeType: ComponentType[type],
      render,
    }
  }
}

export function readComponent<T extends CordoComponent<StringComponentType>>(comp: T): T[typeof CordoComponent] {
  return comp[CordoComponent]!
}

export function isComponent(t: Record<string, any>): t is CordoComponent<StringComponentType> {
  return CordoComponent in t
}

export function renderComponent(c: CordoComponent<StringComponentType> | CordoComponentPayload<StringComponentType>, parent: StringComponentType | null, hirarchy: Array<StringComponentType> = []) {
  const extracted = CordoComponent in c ? readComponent(c) : c
  return extracted.render({
    hirarchy: parent
      ? [ parent, ...hirarchy ]
      : hirarchy
  })
}

export function renderComponentList(
  list: Array<CordoComponent<StringComponentType> | CordoModifier>,
  parent: StringComponentType | null,
  hirarchy: Array<StringComponentType> = []
) {
  let pipeline: Array<CordoComponentPayload<StringComponentType>> = []
  const rowBuilder: Array<CordoComponent<StringComponentType>> = []
  const modifiers: Array<ReturnType<typeof readModifier>> = []

  for (const item of list) {
    if (!isComponent(item)) {
      const mod = readModifier(item)
      if (!modifiers.some(m => m.name === mod.name))
        modifiers.push(mod)
      continue
    }

    let parsed = readComponent(item)
    for (const mod of modifiers) {
      if (mod.hooks?.onRender)
        parsed = mod.hooks.onRender(parsed)
    }

    if (parent !== 'ActionRow') {
      if (parsed.nativeName === 'Button') {
        rowBuilder.push(item)
        if (rowBuilder.length === 5) {
          pipeline.push(readComponent(row(...rowBuilder as any)))
          rowBuilder.splice(0)
        }
        continue
      }

      if (parsed.nativeName === 'StringSelect') {
        if (rowBuilder.length > 0) {
          pipeline.push(readComponent(row(...rowBuilder as any)))
          rowBuilder.splice(0)
        }

        pipeline.push(readComponent(row(item as any)))
        continue
      }
    }

    if (rowBuilder.length > 0) {
      pipeline.push(readComponent(row(...rowBuilder as any)))
      rowBuilder.splice(0)
    }

    pipeline.push(parsed)
  }

  if (rowBuilder.length > 0) {
    pipeline.push(readComponent(row(...rowBuilder as any)))
    rowBuilder.splice(0)
  }

  for (const mod of modifiers) {
    if (mod.hooks?.preRender)
      pipeline = mod.hooks.preRender(pipeline)
  }

  let output = pipeline.map(c => renderComponent(c, parent, hirarchy))

  for (const mod of modifiers) {
    if (mod.hooks?.postRender)
      output = mod.hooks.postRender(output)
  }

  return output
}
