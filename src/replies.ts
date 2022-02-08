import { InteractionApplicationCommandCallbackData, InteractionComponentHandler, InteractionReplyContext, InteractionReplyStateLevelThree, InteractionReplyStateLevelTwo, InteractionReplyTimeoutOptions } from './types/custom'
import { InteractionCallbackType, InteractionResponseFlags } from './types/const'
import { CommandInteraction, ComponentInteraction, GenericInteraction, InteractionJanitor, ReplyableCommandInteraction, ReplyableComponentInteraction, SlotedContext, ReplyableCommandAutocompleteInteraction, CommandAutocompleteInteraction, CommandArgumentChoice } from './types/base'
import CordoAPI from './api'
import Cordo from './index'


export default class CordoReplies {

  /* TODO @metrics */
  // public static readonly activeInteractionReplyContexts: InteractionReplyContext[] = []
  public static readonly activeInteractionReplyContexts: Map<string, InteractionReplyContext> = new Map()

  //

  public static newInteractionReplyContext(i: GenericInteraction, customId?: string): InteractionReplyContext {
    const context: InteractionReplyContext = {
      id: customId ?? i.id,
      interaction: i,
      timeout: -1,
      timeoutRunFunc: null,
      timeoutRunner: null,
      onInteraction: 'doNothing',
      handlers: new Map(),
      slottedHandlers: new Set()
    }

    this.activeInteractionReplyContexts.set(context.id, context)
    setTimeout(
      (id: string) => CordoReplies.activeInteractionReplyContexts.delete(id),
      15 * 60e3,
      context.id
    )

    return context
  }

  public static buildReplyableCommandInteraction(i: CommandInteraction, slotContext?: SlotedContext): ReplyableCommandInteraction {
    if (slotContext) (i as CommandInteraction & SlotedContext).params = slotContext.params
    return {
      ...i,
      defer(privately = false) {
        return CordoAPI.interactionCallback(
          i,
          InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
          privately ? { flags: InteractionResponseFlags.EPHEMERAL } : null
        )
      },
      reply(data: InteractionApplicationCommandCallbackData) {
        return CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data)
      },
      replyInteractive(data: InteractionApplicationCommandCallbackData) {
        const context = CordoReplies.newInteractionReplyContext(i)
        CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data, context.id)
        return CordoReplies.getLevelTwoReplyState(context)
      },
      replyPrivately(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, { ...data, flags: InteractionResponseFlags.EPHEMERAL })
      },
      async state(state?: string, ...args: any) {
        if (!state) state = i.data.name

        if (!Cordo._data.uiStates.has(state)) {
          Cordo._data.logger.warn(`Command ${i.data.name} tried to apply state non-existent ${state}`)
          return
        }

        let data = Cordo._data.uiStates.get(state)(i, args)
        if ((data as any).then) data = await data
        CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data as InteractionApplicationCommandCallbackData)
      }
    }
  }

  public static buildReplyableComponentInteraction(i: ComponentInteraction, slotContext?: SlotedContext): ReplyableComponentInteraction {
    if (slotContext) (i as ComponentInteraction & SlotedContext).params = slotContext.params
    return {
      ...i,
      ack() {
        CordoAPI.interactionCallback(i, InteractionCallbackType.DEFERRED_UPDATE_MESSAGE)
      },
      reply(data: InteractionApplicationCommandCallbackData) {
        return CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data)
      },
      replyInteractive(data: InteractionApplicationCommandCallbackData) {
        const context = CordoReplies.newInteractionReplyContext(i)
        CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data, context.id)
        return CordoReplies.getLevelTwoReplyState(context)
      },
      replyPrivately(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, { ...data, flags: InteractionResponseFlags.EPHEMERAL })
      },
      edit(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, data, CordoReplies.activeInteractionReplyContexts.get(i.message.interaction?.id)?.id)
      },
      editInteractive(data: InteractionApplicationCommandCallbackData) {
        const isAlreadyInteractive = CordoReplies.activeInteractionReplyContexts.has(i.message?.interaction?.id)

        if (isAlreadyInteractive) {
          const context = CordoReplies.activeInteractionReplyContexts.get(i.message?.interaction?.id)
          CordoAPI.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, data, context.id)
          return CordoReplies.getLevelTwoReplyState(context)
        } else {
          const context = CordoReplies.newInteractionReplyContext(i)
          CordoAPI.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, data, context.id)
          return CordoReplies.getLevelTwoReplyState(context)
        }
      },
      // disableComponents() { TODO
      //   API.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, {
      //     components: i.message.components
      //   })
      // },
      removeComponents() {
        CordoAPI.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, { components: [] })
      },
      async state(state?: string, ...args: any) {
        if (!state) state = i.data.custom_id

        if (!Cordo._data.uiStates.has(state)) {
          Cordo._data.logger.warn(`Component ${i.data.custom_id} tried to apply state non-existent ${state}`)
          return
        }

        let data = Cordo._data.uiStates.get(state)(i, args)
        if ((data as any).then) data = await data
        CordoAPI.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, data as InteractionApplicationCommandCallbackData)
      }
    }
  }

  public static buildReplyableCommandAutocompleteInteraction(i: CommandAutocompleteInteraction): ReplyableCommandAutocompleteInteraction {
    return {
      ...i,
      ack() {
        return CordoAPI.interactionCallback(
          i,
          InteractionCallbackType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
          { choices: [] }
        )
      },
      show(choices: CommandArgumentChoice[]) {
        return CordoAPI.interactionCallback(
          i,
          InteractionCallbackType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
          { choices }
        )
      }
    }
  }

  //

  private static getJanitor(context: InteractionReplyContext): InteractionJanitor {
    return {
      edit(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(context.interaction, InteractionCallbackType.UPDATE_MESSAGE, data)
      },
      removeComponents() {
        CordoAPI.interactionCallback(context.interaction, InteractionCallbackType.UPDATE_MESSAGE, { components: [] })
      },
      disableComponents() {
        CordoAPI.interactionCallback(context.interaction, InteractionCallbackType.UPDATE_MESSAGE, {
          components: ((context.interaction._answerComponents as any) || [])
            .map(row => ({
              ...row,
              components: row.components.map(c => ({
                ...c,
                disabled: true
              }))
            }))
        }, null, true)
      },
      async state(state?: string, ...args: any) {
        if (!state) state = context.interaction.id

        if (!Cordo._data.uiStates.has(state)) {
          Cordo._data.logger.warn(`Janitor tried to apply non-existent state ${state}`)
          return
        }

        let data = Cordo._data.uiStates.get(state)(context.interaction, args)
        if ((data as any).then) data = await data
        CordoAPI.interactionCallback(context.interaction, InteractionCallbackType.UPDATE_MESSAGE, data as InteractionApplicationCommandCallbackData)
      }
    }
  }

  /**
   * Gets the object to .withTimeout(...) on
   */
   public static getLevelTwoReplyState(context: InteractionReplyContext): InteractionReplyStateLevelTwo {
    return {
      _context: context,
      withTimeout(timeout: number, janitor: (edit: InteractionJanitor) => any, options?: InteractionReplyTimeoutOptions) {
        if (timeout > 15 * 60 * 1000) {
          Cordo._data.logger.error('Interactions timeout cannot be bigger than 15 minutes')
          timeout = 15 * 60 * 1000
        }

        context.timeout = timeout
        context.onInteraction = options?.onInteraction
        context.timeoutRunFunc = (skipJanitor = false) => {
          CordoReplies.activeInteractionReplyContexts.delete(context.id)
          if (!skipJanitor)
            janitor(CordoReplies.getJanitor(context))
          delete context.handlers
          delete context.slottedHandlers
          context.handlers = null
          context.slottedHandlers = null
        }
        context.timeoutRunner = setTimeout(context.timeoutRunFunc, timeout)
        return CordoReplies.getLevelThreeReplyState(context)
      }
    }
  }

  /**
   * Gets the object to .on(...) on
   */
  public static getLevelThreeReplyState(context: InteractionReplyContext): InteractionReplyStateLevelThree {
    const state: InteractionReplyStateLevelThree = {
      _context: context,
      on(customId: string, handler: InteractionComponentHandler) {
        if (!context.handlers) return // => timeout already reached and object destroyed

        context.handlers.set(customId, handler)
        if (customId.includes('$')) {
          context.slottedHandlers.add({
            id: customId,
            regex: new RegExp(customId.replace(/\$[a-zA-Z0-9]+/g, '[a-zA-Z0-9]+')),
            handler
          })
        }
        return state
      },
      edit(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(context.interaction, InteractionCallbackType.UPDATE_MESSAGE, data)
      },
      followUp(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(context.interaction, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data)
      },
      triggerJanitor() {
        clearTimeout(context.timeoutRunner)
        context.timeoutRunFunc()
      }
    }
    return state
  }

}
