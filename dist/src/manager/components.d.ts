import { ComponentInteraction } from '../types/base';
import { InteractionComponentHandler, SlottedComponentHandler } from '../types/custom';
export default class CordoComponentsManager {
    static readonly componentHandlers: Map<string, InteractionComponentHandler>;
    static readonly slottedComponentHandlers: Set<SlottedComponentHandler>;
    static findComponentHandlers(dir: string | string[], prefix?: string): void;
    static registerComponentHandler(id: string, handler: InteractionComponentHandler): void;
    static onComponent(i: ComponentInteraction): Promise<void>;
    private static findAndExecuteHandler;
    private static contextOnInteraction;
}
