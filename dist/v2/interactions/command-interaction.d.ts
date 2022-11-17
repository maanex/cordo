import { Const } from "../types/const";
import { EditableInteractionMessage, InteractionMember, InteractionMessage, InteractionMessageAttachment, InteractionRole, InteractionUser, PartialInteractionChannel, PartialInteractionMessage, Snowflake } from "../types/discord";
import { CommandOption, InteractionReplies, TextBasedInteractionCallbackData } from "./$shared-types";
type Resolved = {
    users?: Map<Snowflake, InteractionUser>;
    members?: Map<Snowflake, InteractionMember>;
    roles?: Map<Snowflake, InteractionRole>;
    channels?: Map<Snowflake, PartialInteractionChannel>;
    messages?: Map<Snowflake, PartialInteractionMessage>;
    attachments?: Map<Snowflake, InteractionMessageAttachment>;
};
type TargetForChatInput = {
    type: Const.InteractionCommandType.CHAT_INPUT;
    target: undefined;
    targetId: undefined;
};
type TargetForUser = {
    type: Const.InteractionCommandType.USER;
    target: InteractionUser;
    targetId: Snowflake;
};
type TargetForMessage = {
    type: Const.InteractionCommandType.MESSAGE;
    target: InteractionMessage;
    targetId: Snowflake;
};
type TargetForUnknown = {
    type: Const.InteractionCommandType;
    target: unknown;
    targetId: unknown;
};
export type RawCommandInteractionData = {
    id: Snowflake;
    name: string;
    type: Const.InteractionCommandType;
    resolved?: Resolved;
    options?: CommandOption[];
    target_id?: Snowflake;
};
export type CommandInteractionData = {
    id: Snowflake;
    name: string;
    type: Const.InteractionCommandType;
    resolved: Resolved;
    target: undefined;
    targetId: undefined;
    options: Record<string, string | number>;
} & (TargetForChatInput | TargetForUser | TargetForMessage | TargetForUnknown);
export type CommandInteractionReplyFunctions = {
    defer(privately?: boolean): Promise<InteractionMessage>;
    reply<CustomIds extends string>(data: CommandInteractionCallbackData<CustomIds>): Promise<EditableInteractionMessage>;
    replyInteractive<CustomIds extends string>(data: CommandInteractionCallbackData<CustomIds>): InteractionReplies.LevelTwoState<CustomIds>;
    replyPrivately<CustomIds extends string>(data: CommandInteractionCallbackData<CustomIds>): void;
    openModal(data: Const.TODO): void;
    openModalInteractive(data: Const.TODO): Const.TODO;
    applyState(state?: string, data?: any): void;
};
export type CommandInteractionCallbackData<CustomIds extends string> = TextBasedInteractionCallbackData<CustomIds>;
export declare function parseCommandInteractionData(data: RawCommandInteractionData): CommandInteractionData;
export {};
