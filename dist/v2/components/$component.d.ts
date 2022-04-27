import { ComponentType } from "../../types/const";
export declare type SerializedMessageComponent<Type extends ComponentType> = {
    type: Type;
    [key: string]: any;
};
export declare type SerializionContext = {
    id?: string;
};
export declare abstract class MessageComponent<Type extends ComponentType, CustomId extends string> {
    abstract serialize(context?: SerializionContext): SerializedMessageComponent<Type>;
    abstract get doRender(): boolean;
    abstract get customId(): CustomId;
}
export declare type GenericMessageComponent = MessageComponent<ComponentType, string>;
