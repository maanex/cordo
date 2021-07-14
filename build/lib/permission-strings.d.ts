import { Permissions } from 'discord.js';
export default class PermissionStrings {
    static readonly BIT: Record<keyof typeof Permissions.FLAGS, bigint>;
    static permissionStringContains(string: string | bigint, per: number | bigint): boolean;
    static containsAdmin(string: string | bigint): boolean;
    static containsManageServer(string: string | bigint): boolean;
    static containsManageMessages(string: string | bigint): boolean;
}
