import { InteractionResponseFlags } from "discord-interactions"
import Cordo from ".."
import CordoAPI from "../api"
import { GenericInteraction } from "../types/base"
import { InteractionCallbackType } from "../types/const"


export default class UserErrorMessages {
 
  public static interactionNotPermitted(i: GenericInteraction, text?: string): any {
    return CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, {
      title: Cordo._data.config.texts.interaction_not_permitted_title,
      description: text || Cordo._data.config.texts.interaction_not_permitted_description_generic,
      flags: InteractionResponseFlags.EPHEMERAL
    })
  }

  public static interactionNotOwned(i: GenericInteraction, command?: string, owner?: string): any {
    return CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, {
      title: Cordo._data.config.texts.interaction_not_owned_title,
      description: Cordo._data.config.texts.interaction_not_owned_description,
      flags: InteractionResponseFlags.EPHEMERAL,
      _context: { command, owner }
    })
  }

  public static interactionInvalid(i: GenericInteraction, text?: string, command?: string): any {
    return CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, {
      title: Cordo._data.config.texts.interaction_invalid_title,
      description: Cordo._data.config.texts.interaction_invalid_description,
      flags: InteractionResponseFlags.EPHEMERAL,
      _context: { text, command }
    })
  }

  public static interactionFailed(i: GenericInteraction): any {
    return CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, {
      content: Cordo._data.config.texts.interaction_failed,
      flags: InteractionResponseFlags.EPHEMERAL
    })
  }

}
