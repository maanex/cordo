import { Const } from "../types/const";
import { EditableInteractionMessage, InteractionEmoji } from "../types/discord";
import { InteractionReplies, TextBasedInteractionCallbackData } from "./$shared-types";
declare type SelectOptionValue = {
    label: string;
    value: string;
    description?: string;
    emoji?: Partial<InteractionEmoji>;
    default?: boolean;
};
export declare type RawComponentInteractionData = {
    custom_id: string;
    component_type: Const.ComponentType;
    values: SelectOptionValue[];
};
export declare type ComponentInteractionData = {
    customId: string;
    type: Const.ComponentType;
    values: SelectOptionValue[];
};
export declare type ComponentInteractionReplyFunctions = {
    ack(): void;
    reply<CustomIds extends string>(data: ComponentInteractionCallbackData<CustomIds>): Promise<EditableInteractionMessage>;
    replyInteractive<CustomIds extends string>(data: ComponentInteractionCallbackData<CustomIds>): InteractionReplies.LevelTwoState<CustomIds>;
    replyPrivately<CustomIds extends string>(data: ComponentInteractionCallbackData<CustomIds>): void;
    edit<CustomIds extends string>(data: ComponentInteractionCallbackData<CustomIds>): void;
    editInteractive<CustomIds extends string>(data: ComponentInteractionCallbackData<CustomIds>): InteractionReplies.LevelTwoState<CustomIds>;
    openModal(data: Const.TODO): void;
    openModalInteractive(data: Const.TODO): Const.TODO;
    removeComponents(): void;
    applyState(state?: string, data?: any): void;
};
export declare type ComponentInteractionCallbackData<CustomIds extends string> = TextBasedInteractionCallbackData<CustomIds>;
export declare function parseComponentInteractionData(data: RawComponentInteractionData): ComponentInteractionData;
export {};
