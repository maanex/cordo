import { Interaction } from "../interactions/$interaction";
import { Const } from "../types/const";
export declare abstract class CommandInteractionHandler {
    /**
     * Build the command, return description, options, etc
     * Does not need to include command name since that's interferred from file name
     * @param context Context that includes language file
     */
    abstract build(context: Const.TODO): Const.TODO;
    /**
     * Handle an interaction
     * @param i The interaction to handle
     */
    abstract handle(i: Interaction<'COMMAND'>): void;
}
