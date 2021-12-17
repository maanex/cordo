import { InteractionApplicationCommandCallbackData } from './types/custom';
import { GenericInteraction } from './types/base';
import { InteractionCallbackFollowup } from './index';
export default class CordoAPI {
    static interactionCallback(i: GenericInteraction, type: number, data?: InteractionApplicationCommandCallbackData, contextId?: string, useRaw?: boolean): Promise<InteractionCallbackFollowup>;
    private static handleCallbackResponse;
    /**
     * Transforms the shorthand way of writing into proper discord api compatible objects
     */
    static normaliseData(data: InteractionApplicationCommandCallbackData, i: GenericInteraction, contextId?: string): void;
}
