import { GenericInteraction } from "../types/base";
export default class UserErrorMessages {
    static interactionNotPermitted(i: GenericInteraction, text?: string): any;
    static interactionNotOwned(i: GenericInteraction, command?: string, owner?: string): any;
    static interactionInvalid(i: GenericInteraction, text?: string, command?: string): any;
    static interactionFailed(i: GenericInteraction): any;
}
