import { GenericMessageComponent } from "../components/$component";
import { Const } from "../types/const";
import { InteractionMember, InteractionUser, Snowflake } from "../types/discord";
import { GuildData, UserData } from "../types/middleware";
import { AutocompleteInteractionData, AutocompleteInteractionReplyFunctions } from "./autocomplete-interaction";
import { CommandInteractionData, CommandInteractionReplyFunctions } from "./command-interaction";
import { ComponentInteractionData, ComponentInteractionReplyFunctions } from "./component-interaction";
import { ModalSubmitInteractionData, ModalSubmitInteractionReplyFunctions } from "./modal-submit-interaction";
export type RawInteraction<Type extends Const.InteractionTypeNames> = {
    type: Const.InteractionTypeMapping[Type];
    data: any;
    id: Snowflake;
    application_id: Snowflake;
    version: number;
    token: string;
    user?: InteractionUser;
    member?: InteractionMember;
    locale?: string;
    guild_locale?: string;
};
export type RawGenericInteraction = RawInteraction<Const.InteractionTypeNames>;
type InteractionDataMap = {
    PING: undefined;
    COMMAND: CommandInteractionData;
    COMPONENT: ComponentInteractionData;
    COMMAND_AUTOCOMPLETE: AutocompleteInteractionData;
    MODAL_SUBMIT: ModalSubmitInteractionData;
};
type InteractionReplyMap = {
    PING: {};
    COMMAND: CommandInteractionReplyFunctions;
    COMPONENT: ComponentInteractionReplyFunctions;
    COMMAND_AUTOCOMPLETE: AutocompleteInteractionReplyFunctions;
    MODAL_SUBMIT: ModalSubmitInteractionReplyFunctions;
};
export type ReadonlyInteraction<Type extends Const.InteractionTypeNames> = {
    type: Const.InteractionTypeMapping[Type];
    data: InteractionDataMap[Type];
    id: Snowflake;
    applicationId: Snowflake;
    version: number;
    token: string;
    user: InteractionUser;
    userLocale: string;
    guildMember?: InteractionMember;
    guildLocale?: string;
    guildData?: GuildData;
    userData?: UserData;
    params: Record<string, string>;
};
export type Interaction<Type extends Const.InteractionTypeNames> = {
    _answered: boolean;
    _httpCallback?: (payload: any) => any;
    _answerComponents: GenericMessageComponent[];
} & ReadonlyInteraction<Type> & InteractionReplyMap[Type];
export type GenericInteraction = Interaction<Const.InteractionTypeNames>;
export declare function parseInteraction<T extends Const.InteractionTypeNames>(input: RawInteraction<T>): ReadonlyInteraction<T>;
export {};
