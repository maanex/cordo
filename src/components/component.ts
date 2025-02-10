

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
    render: () => Record<string, any>
  }
}

export function createComponent<Type extends StringComponentType>(type: Type, render: () => Record<string, any>): CordoComponent<Type> {
  return {
    [CordoComponent]: {
      nativeName: type,
      nativeType: ComponentType[type],
      render,
    }
  }
}
