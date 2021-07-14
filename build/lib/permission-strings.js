"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class PermissionStrings {
    static permissionStringContains(string, per) {
        if (typeof string !== 'bigint')
            string = BigInt(string);
        if (typeof per !== 'bigint')
            per = BigInt(per);
        return (string & per) !== 0n;
    }
    //
    static containsAdmin(string) {
        return PermissionStrings.permissionStringContains(string, PermissionStrings.BIT.ADMINISTRATOR);
    }
    static containsManageServer(string) {
        return PermissionStrings.permissionStringContains(string, PermissionStrings.BIT.MANAGE_GUILD)
            || PermissionStrings.containsAdmin(string);
    }
    static containsManageMessages(string) {
        return PermissionStrings.permissionStringContains(string, PermissionStrings.BIT.MANAGE_MESSAGES)
            || PermissionStrings.containsAdmin(string);
    }
}
exports.default = PermissionStrings;
PermissionStrings.BIT = Object
    .keys(discord_js_1.Permissions.FLAGS)
    .map(k => [k, BigInt(discord_js_1.Permissions.FLAGS[k])])
    .reduce((c, o) => ({ ...c, [o[0]]: o[1] }), {});
//# sourceMappingURL=permission-strings.js.map