import Cordo from ".."
import { ComponentInteraction } from "../types/base"
import { InteractionComponentFlag } from "../types/const"
import PermissionStrings from "./permission-strings"
import UserErrorMessages from "./user-error-messages"


export default class PermissionChecks {

  public static isBotOwner(userid: string): boolean {
    if (!Cordo._data.config.botAdmins) return false

    if (typeof Cordo._data.config.botAdmins === 'function')
      return Cordo._data.config.botAdmins(userid)
    else
      return Cordo._data.config.botAdmins.includes(userid)
  }

  //

  public static async componentPermissionCheck(i: ComponentInteraction): Promise<boolean> {
    if (await PermissionChecks.isBotOwner(i.user.id))
      return true

    if (i.data.flags.includes(InteractionComponentFlag.ACCESS_BOT_ADMIN)) {
      UserErrorMessages.interactionNotPermitted(
        i,
        Cordo._data.config.texts.interaction_not_permitted_description_bot_admin
      )
      return false
    }

    if (!i.data.flags.includes(InteractionComponentFlag.ACCESS_EVERYONE)) {
      const interactionOwner = i.message.interaction?.user

      if (interactionOwner?.id !== i.user.id) {
        UserErrorMessages.interactionNotOwned(
          i,
          i.message.interaction ? `/${i.message.interaction?.name}` : 'the command yourself',
          interactionOwner?.username || 'the interaction owner'
        )
        return false
      }
    }

    if (!i.member)
      return true

    if (i.data.flags.includes(InteractionComponentFlag.ACCESS_ADMIN) && !PermissionStrings.containsAdmin(i.member.permissions)) {
      UserErrorMessages.interactionNotPermitted(
        i,
        Cordo._data.config.texts.interaction_not_permitted_description_guild_admin
      )
      return false
    }

    if (i.data.flags.includes(InteractionComponentFlag.ACCESS_MANAGE_SERVER) && !PermissionStrings.containsManageServer(i.member.permissions)) {
      UserErrorMessages.interactionNotPermitted(
        i,
        Cordo._data.config.texts.interaction_not_permitted_description_manage_server
      )
      return false
    }

    if (i.data.flags.includes(InteractionComponentFlag.ACCESS_MANAGE_MESSAGES) && !PermissionStrings.containsManageMessages(i.member.permissions)) {
      UserErrorMessages.interactionNotPermitted(
        i,
        Cordo._data.config.texts.interaction_not_permitted_description_manage_messages
      )
      return false
    }

    return true
  }

}
