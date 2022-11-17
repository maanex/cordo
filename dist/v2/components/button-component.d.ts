import { InteractionEmoji } from "../../types/base";
import { ComponentType, InteractionComponentFlag } from "../../types/const";
import { ExactlyOne, OneOrBoth } from "../types/helper";
import { MessageComponent } from "./$component";
export type ButtonStyle = 'PRIMARY' | 'BLUE' | 'SECONDARY' | 'GRAY' | 'GREY' | 'SUCCESS' | 'GREEN' | 'DANGER' | 'RED';
type HelperLabelOrEmoji = OneOrBoth<{
    label: string;
}, {
    emoji: Partial<InteractionEmoji>;
}>;
type HelperStyleOrLink<CustomId extends string> = ExactlyOne<{
    style?: ButtonStyle; /** reference */
    customId: CustomId;
}, {
    url: string;
}>;
export type CreateButtonOptions<CustomId extends string> = {
    /** the button will render on screen but will not be clickable */
    disabled?: boolean;
    /** the button will be hidden completely and will not count towards the maximum component amount */
    visible?: boolean;
    /** flags to control who can interact how */
    flags?: InteractionComponentFlag[];
} & HelperLabelOrEmoji & HelperStyleOrLink<CustomId>;
type CreateButtonInlineLabel = string | Partial<InteractionEmoji> | [Partial<InteractionEmoji>, string];
export declare function button<ID extends string>(options: CreateButtonOptions<ID>): MessageComponent<ComponentType.BUTTON, ID>;
export declare function button<ID extends string>(customId: ID, label: CreateButtonInlineLabel, style?: ButtonStyle, disabled?: boolean, flags?: InteractionComponentFlag | InteractionComponentFlag[]): MessageComponent<ComponentType.BUTTON, ID>;
export declare namespace button {
    var link: (url: `https://${string}` | `http://${string}` | `discord://${string}`, label: CreateButtonInlineLabel, disabled?: boolean) => MessageComponent<ComponentType.BUTTON, null>;
}
export {};
