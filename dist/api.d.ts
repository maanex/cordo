import { InteractionApplicationCommandCallbackData, InteractionCallbackFollowup } from './types/custom';
import { GenericInteraction } from './types/base';
import { InteractionCallbackType, InteractionComponentFlag } from './types/const';
import { InteractionApplicationCommandAutocompleteCallbackData, InteractionDefferedCallbackData, InteractionOpenModalData } from './index';
export default class CordoAPI {
    static interactionCallback(i: GenericInteraction, type: InteractionCallbackType.PONG): Promise<InteractionCallbackFollowup>;
    static interactionCallback(i: GenericInteraction, type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data: InteractionApplicationCommandCallbackData, contextId?: string, useRaw?: boolean): Promise<InteractionCallbackFollowup>;
    static interactionCallback(i: GenericInteraction, type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE, data?: InteractionDefferedCallbackData): Promise<InteractionCallbackFollowup>;
    static interactionCallback(i: GenericInteraction, type: InteractionCallbackType.DEFERRED_UPDATE_MESSAGE, data?: InteractionDefferedCallbackData): Promise<InteractionCallbackFollowup>;
    static interactionCallback(i: GenericInteraction, type: InteractionCallbackType.UPDATE_MESSAGE, data: InteractionApplicationCommandCallbackData, contextId?: string, useRaw?: boolean): Promise<InteractionCallbackFollowup>;
    static interactionCallback(i: GenericInteraction, type: InteractionCallbackType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT, data: InteractionApplicationCommandAutocompleteCallbackData, contextId?: string, useRaw?: boolean): Promise<InteractionCallbackFollowup>;
    static interactionCallback(i: GenericInteraction, type: InteractionCallbackType.MODAL, data: InteractionOpenModalData, contextId?: string, useRaw?: boolean): Promise<InteractionCallbackFollowup>;
    private static handleCallbackResponse;
    /**
     * Transforms the shorthand way of writing into proper discord api compatible objects
     */
    static normaliseData(data: InteractionApplicationCommandCallbackData, i: GenericInteraction, contextId?: string, type?: InteractionCallbackType): void;
    private static normalizeFindAndResolveSmartEmbed;
    static compileCustomId(customId: string, flags?: InteractionComponentFlag[], contextId?: string): string;
    static parseCustomId(rawId: string): {
        contextId: any;
        _reserved: any;
        customId: any;
        flagsRaw: any;
    };
}
