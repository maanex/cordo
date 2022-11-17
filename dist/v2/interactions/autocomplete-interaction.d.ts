import { InteractionChoice } from "../types/discord";
import { CommandOption } from "./$shared-types";
export type RawAutocompleteInteractionData = {
    options: CommandOption[];
};
export type AutocompleteInteractionData = {
    options: CommandOption[];
};
export type AutocompleteInteractionReplyFunctions = {
    noResults(): void;
    show(choices: InteractionChoice[]): void;
};
export declare function parseAutocompleteInteractionData(data: RawAutocompleteInteractionData): AutocompleteInteractionData;
