import { MessageComponentSelectOption } from "../../types/component";
import { ComponentType } from "../../types/const";
import { SerializedMessageComponent } from "../components/$component";
import { EditableInteractionMessage } from "../types/discord";
import { InteractionReplies, TextBasedInteractionCallbackData } from "./$shared-types";
export declare type RawModalSubmitInteractionData = {
    components: SerializedMessageComponent<ComponentType>[];
};
export declare type ModalSubmitInteractionData = {
    components: Record<string, string | number | MessageComponentSelectOption[]>;
};
export declare type ModalSubmitInteractionReplyFunctions = {
    ack(): void;
    reply<CustomIds extends string>(data: ModalSubmitInteractionCallbackData<CustomIds>): Promise<EditableInteractionMessage>;
    replyInteractive<CustomIds extends string>(data: ModalSubmitInteractionCallbackData<CustomIds>): InteractionReplies.LevelTwoState<CustomIds>;
    replyPrivately<CustomIds extends string>(data: ModalSubmitInteractionCallbackData<CustomIds>): void;
    edit<CustomIds extends string>(data: ModalSubmitInteractionCallbackData<CustomIds>): void;
    editInteractive<CustomIds extends string>(data: ModalSubmitInteractionCallbackData<CustomIds>): InteractionReplies.LevelTwoState<CustomIds>;
    removeComponents(): void;
    applyState(state?: string, data?: any): void;
};
export declare type ModalSubmitInteractionCallbackData<CustomIds extends string> = TextBasedInteractionCallbackData<CustomIds>;
export declare function parseModalSubmitInteractionData(data: RawModalSubmitInteractionData): ModalSubmitInteractionData;
