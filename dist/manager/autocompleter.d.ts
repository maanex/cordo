import { InteractionCommandAutocompleteHandler } from '../types/custom';
import { CommandAutocompleteInteraction } from '../types/base';
export default class CordoAutocompleterManager {
    static readonly autocompleteHandlers: Map<string, InteractionCommandAutocompleteHandler>;
    static findAutocompleteHandlers(dir: string | string[], prefix?: string): Promise<void>;
    static registerAutocompleteHandler(id: string, handler: InteractionCommandAutocompleteHandler): void;
    static onCommandAutocomplete(i: CommandAutocompleteInteraction): void;
}
