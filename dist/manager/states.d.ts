import { InteractionUIState } from '../types/custom';
export default class CordoStatesManager {
    static readonly uiStates: Map<string, InteractionUIState>;
    static findUiStates(dir: string | string[], prefix?: string): void;
    static registerUiState(id: string, state: InteractionUIState): void;
}
