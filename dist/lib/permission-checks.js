"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const const_1 = require("../types/const");
const permission_strings_1 = require("./permission-strings");
const user_error_messages_1 = require("./user-error-messages");
class PermissionChecks {
    static isBotOwner(userid) {
        if (!__1.default._data.config.botAdmins)
            return false;
        if (typeof __1.default._data.config.botAdmins === 'function')
            return __1.default._data.config.botAdmins(userid);
        else
            return __1.default._data.config.botAdmins.includes(userid);
    }
    //
    static async componentPermissionCheck(i) {
        if (await PermissionChecks.isBotOwner(i.user.id))
            return true;
        if (i.data.flags.includes(const_1.InteractionComponentFlag.ACCESS_BOT_ADMIN)) {
            user_error_messages_1.default.interactionNotPermitted(i, __1.default._data.config.texts.interaction_not_permitted_description_bot_admin);
            return false;
        }
        if (!i.data.flags.includes(const_1.InteractionComponentFlag.ACCESS_EVERYONE)) {
            const interactionOwner = i.message.interaction?.user;
            if (interactionOwner?.id !== i.user.id) {
                user_error_messages_1.default.interactionNotOwned(i, i.message.interaction ? `/${i.message.interaction?.name}` : 'the command yourself', interactionOwner?.username || 'the interaction owner');
                return false;
            }
        }
        if (!i.member)
            return true;
        if (i.data.flags.includes(const_1.InteractionComponentFlag.ACCESS_ADMIN) && !permission_strings_1.default.containsAdmin(i.member.permissions)) {
            user_error_messages_1.default.interactionNotPermitted(i, __1.default._data.config.texts.interaction_not_permitted_description_guild_admin);
            return false;
        }
        if (i.data.flags.includes(const_1.InteractionComponentFlag.ACCESS_MANAGE_SERVER) && !permission_strings_1.default.containsManageServer(i.member.permissions)) {
            user_error_messages_1.default.interactionNotPermitted(i, __1.default._data.config.texts.interaction_not_permitted_description_manage_server);
            return false;
        }
        if (i.data.flags.includes(const_1.InteractionComponentFlag.ACCESS_MANAGE_MESSAGES) && !permission_strings_1.default.containsManageMessages(i.member.permissions)) {
            user_error_messages_1.default.interactionNotPermitted(i, __1.default._data.config.texts.interaction_not_permitted_description_manage_messages);
            return false;
        }
        return true;
    }
}
exports.default = PermissionChecks;
//# sourceMappingURL=permission-checks.js.map