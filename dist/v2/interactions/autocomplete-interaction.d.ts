import { InteractionChoice } from "../types/discord";
import { CommandOption } from "./$shared-types";
export declare type RawAutocompleteInteractionData = {
    options: CommandOption[];
};
export declare type AutocompleteInteractionData = {
    options: CommandOption[];
};
export declare type AutocompleteInteractionReplyFunctions = {
    noResults(): void;
    show(choices: InteractionChoice[]): void;
};
export declare function parseAutocompleteInteractionData(data: RawAutocompleteInteractionData): AutocompleteInteractionData;
