import { InteractionReplyContext, InteractionReplyStateLevelThree, InteractionReplyStateLevelTwo } from './types/custom';
import { CommandInteraction, ComponentInteraction, GenericInteraction, ReplyableCommandInteraction, ReplyableComponentInteraction } from './types/base';
export default class CordoReplies {
    static readonly activeInteractionReplyContexts: InteractionReplyContext[];
    static findActiveInteractionReplyContext(id: string): InteractionReplyContext | undefined;
    static newInteractionReplyContext(i: GenericInteraction): InteractionReplyContext;
    static buildReplyableCommandInteraction(i: CommandInteraction): ReplyableCommandInteraction;
    static buildReplyableComponentInteraction(i: ComponentInteraction): ReplyableComponentInteraction;
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
