import { InteractionEmoji } from "../../src/types/base";
import { ComponentType, InteractionComponentFlag } from "../../src/types/const";
import { ExactlyOne, OneOrBoth, StringNotStartWith } from "../types/helper";
import { MessageComponent } from "./$component";
export declare type ButtonStyle = 'PRIMARY' | 'BLUE' | 'SECONDARY' | 'GRAY' | 'GREY' | 'SUCCESS' | 'GREEN' | 'DANGER' | 'RED';
declare type HelperLabelOrEmoji = OneOrBoth<{
    label: string;
}, {
    emoji: Partial<InteractionEmoji>;
}>;
declare type HelperStyleOrLink<CustomId extends string> = ExactlyOne<{
    style?: ButtonStyle; /** reference */
    customId: CustomId;
}, {
    url: string;
}>;
export declare type CreateButtonOptions<CustomId extends string> = {
    /** the button will render on screen but will not be clickable */
    disabled?: boolean;
    /** the button will be hidden completely and will not count towards the maximum component amount */
    visible?: boolean;
    /** flags to control who can interact how */
    flags?: InteractionComponentFlag[];
} & HelperLabelOrEmoji & HelperStyleOrLink<CustomId>;
declare type CreateButtonInlineLabel = string | Partial<InteractionEmoji> | [Partial<InteractionEmoji>, string];
declare const ValidUrlPrefixes: readonly ["http", "discord://"];
declare type ValidUrlPrefixType = (typeof ValidUrlPrefixes)[number];
export default function button<ID extends string>(options: CreateButtonOptions<ID>): MessageComponent<ComponentType.BUTTON, ID>;
export default function button<ID extends string>(url: `${ValidUrlPrefixType}${string}`, label: CreateButtonInlineLabel, disabled?: boolean): MessageComponent<ComponentType.BUTTON, ID>;
export default function button<ID extends string>(customId: StringNotStartWith<ID, ValidUrlPrefixType>, label: CreateButtonInlineLabel, style?: ButtonStyle, disabled?: boolean, flags?: InteractionComponentFlag | InteractionComponentFlag[]): MessageComponent<ComponentType.BUTTON, ID>;
export {};
