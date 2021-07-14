import { InteractionReplyContext } from './types/custom';
import { CommandInteraction, ComponentInteraction, ReplyableCommandInteraction, ReplyableComponentInteraction } from './types/base';
export default class CordoReplies {
    private static activeInteractionReplyContexts;
    static findActiveInteractionReplyContext(id: string): InteractionReplyContext | undefined;
    private static newInteractionReplyContext;
    static buildReplyableCommandInteraction(i: CommandInteraction): ReplyableCommandInteraction;
    static buildReplyableComponentInteraction(i: ComponentInteraction): ReplyableComponentInteraction;
    private static getJanitor;
    /**
     * Gets the object to .withTimeout(...) on
     */
    private static getLevelTwoReplyState;
    /**
     * Gets the object to .on(...) on
     */
    private static getLevelThreeReplyState;
}
