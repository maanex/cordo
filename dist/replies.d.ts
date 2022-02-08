import { InteractionReplyContext, InteractionReplyStateLevelThree, InteractionReplyStateLevelTwo } from './types/custom';
import { CommandInteraction, ComponentInteraction, GenericInteraction, ReplyableCommandInteraction, ReplyableComponentInteraction, SlotedContext, ReplyableCommandAutocompleteInteraction, CommandAutocompleteInteraction } from './types/base';
export default class CordoReplies {
    static readonly activeInteractionReplyContexts: Map<string, InteractionReplyContext>;
    static newInteractionReplyContext(i: GenericInteraction, customId?: string): InteractionReplyContext;
    static buildReplyableCommandInteraction(i: CommandInteraction, slotContext?: SlotedContext): ReplyableCommandInteraction;
    static buildReplyableComponentInteraction(i: ComponentInteraction, slotContext?: SlotedContext): ReplyableComponentInteraction;
    static buildReplyableCommandAutocompleteInteraction(i: CommandAutocompleteInteraction): ReplyableCommandAutocompleteInteraction;
    private static getJanitor;
    /**
     * Gets the object to .withTimeout(...) on
     */
    static getLevelTwoReplyState(context: InteractionReplyContext): InteractionReplyStateLevelTwo;
    /**
     * Gets the object to .on(...) on
     */
    static getLevelThreeReplyState(context: InteractionReplyContext): InteractionReplyStateLevelThree;
}
