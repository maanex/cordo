import { InteractionApplicationCommandCallbackData } from './types/custom';
import { GenericInteraction } from './types/base';
export default class CordoAPI {
    static interactionCallback(i: GenericInteraction, type: number, data?: InteractionApplicationCommandCallbackData): void;
    /**
     * Transforms the shorthand way of writing into proper discord api compatible objects
     */
    static normaliseData(data: InteractionApplicationCommandCallbackData, i: GenericInteraction): void;
}
