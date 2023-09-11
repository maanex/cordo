import { Const } from "../types/const"


export type SerializedMessageComponent<Type extends Const.ComponentTypeValues> = {
  type: Type
  [key: string]: any
}

export type SerializionContext = {
  id?: string
}

export abstract class MessageComponent<Type extends Const.ComponentTypeValues, CustomId extends string | undefined> {

  abstract serialize(context?: SerializionContext): SerializedMessageComponent<Type>

  abstract get doRender(): boolean

  abstract get customId(): CustomId

}

export type GenericMessageComponent = MessageComponent<Const.ComponentTypeValues, string>
