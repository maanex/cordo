import { SlottedUIState } from '..';
import { InteractionUIState } from '../types/custom';
export default class CordoStatesManager {
    static readonly uiStates: Map<string, InteractionUIState>;
    static readonly slottedUiStates: Set<SlottedUIState>;
    static findUiStates(dir: string | string[], prefix?: string): Promise<void>;
    static registerUiState(id: string, state: InteractionUIState): void;
    static getStateById(id: string): {
        state: InteractionUIState;
        params: Record<string, string>;
    };
}
