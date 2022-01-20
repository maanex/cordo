import { ComponentInteraction } from "../types/base";
export default class PermissionChecks {
    static isBotOwner(userid: string): boolean;
    static componentPermissionCheck(i: ComponentInteraction): Promise<boolean>;
}
