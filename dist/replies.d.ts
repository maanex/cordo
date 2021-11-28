import { InteractionReplyContext, InteractionReplyStateLevelThree, InteractionReplyStateLevelTwo } from './types/custom';
import { CommandInteraction, ComponentInteraction, GenericInteraction, ReplyableCommandInteraction, ReplyableComponentInteraction, SlotedContext } from './types/base';
export default class CordoReplies {
    static readonly activeInteractionReplyContexts: InteractionReplyContext[];
    static findActiveInteractionReplyContext(id: string): InteractionReplyContext | undefined;
    static newInteractionReplyContext(i: GenericInteraction, customId?: string): InteractionReplyContext;
    static buildReplyableCommandInteraction(i: CommandInteraction): ReplyableCommandInteraction;
    static buildReplyableComponentInteraction(i: ComponentInteraction, slotContext?: SlotedContext): ReplyableComponentInteraction;
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
