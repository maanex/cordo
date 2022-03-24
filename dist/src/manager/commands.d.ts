import { CommandInteraction } from '../types/base';
import { InteractionCommandHandler, SlottedCommandHandler } from '../types/custom';
export default class CordoCommandsManager {
    static readonly commandHandlers: Map<string, InteractionCommandHandler>;
    static readonly slottedCommandHandlers: Set<SlottedCommandHandler>;
    static findCommandHandlers(dir: string | string[], prefix?: string): void;
    static registerCommandHandler(command: string, handler: InteractionCommandHandler): void;
    static onCommand(i: CommandInteraction): void;
    private static findAndExecuteHandler;
    private static onCommandFail;
}
