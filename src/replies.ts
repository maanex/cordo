import { InteractionApplicationCommandCallbackData, InteractionComponentHandler, InteractionReplyContext, InteractionReplyStateLevelThree, InteractionReplyStateLevelTwo, InteractionReplyTimeoutOptions } from './types/custom'
import { InteractionCallbackType, InteractionResponseFlags } from './types/const'
import { CommandInteraction, ComponentInteraction, GenericInteraction, InteractionJanitor, ReplyableCommandInteraction, ReplyableComponentInteraction, SlotedContext } from './types/base'
import CordoAPI from './api'
import Cordo from './index'


export default class CordoReplies {

  /* TODO @metrics */
  public static readonly activeInteractionReplyContexts: InteractionReplyContext[] = []

  //

  public static findActiveInteractionReplyContext(id: string): InteractionReplyContext | undefined {
    return CordoReplies.activeInteractionReplyContexts.find(c => c.id === id)
  }

  //

  public static newInteractionReplyContext(i: GenericInteraction): InteractionReplyContext {
    return {
      id: i.id,
      interaction: i,
      timeout: -1,
      timeoutRunFunc: null,
      timeoutRunner: null,
      onInteraction: 'doNothing',
      handlers: {},
      slottedHandlers: []
    }
  }

  public static buildReplyableCommandInteraction(i: CommandInteraction): ReplyableCommandInteraction {
    return {
      ...i,
      defer(privately = false) {
        CordoAPI.interactionCallback(
          i,
          InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
          privately ? { flags: InteractionResponseFlags.EPHEMERAL } : null
        )
      },
      reply(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data)
      },
      replyInteractive(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data)
        const context = CordoReplies.newInteractionReplyContext(i)
        CordoReplies.activeInteractionReplyContexts.push(context)
        setTimeout(() => CordoReplies.activeInteractionReplyContexts.splice(0, 1), 15 * 60e3)
        return CordoReplies.getLevelTwoReplyState(context)
      },
      replyPrivately(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, { ...data, flags: InteractionResponseFlags.EPHEMERAL })
      },
      async state(state?: string, ...args: any) {
        if (!state) state = i.data.id

        if (!Cordo._data.uiStates[state]) {
          Cordo._data.logger.warn(`Command ${i.data.name} tried to apply state non-existent ${state}`)
          return
        }

        let data = Cordo._data.uiStates[state](i, args)
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
        CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data)
      },
      replyInteractive(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data)
        const context = CordoReplies.newInteractionReplyContext(i)
        CordoReplies.activeInteractionReplyContexts.push(context)
        setTimeout(() => CordoReplies.activeInteractionReplyContexts.splice(0, 1), 15 * 60e3)
        return CordoReplies.getLevelTwoReplyState(context)
      },
      replyPrivately(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, { ...data, flags: InteractionResponseFlags.EPHEMERAL })
      },
      edit(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, data)
      },
      editInteractive(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, data)
        const context = CordoReplies.newInteractionReplyContext(i)
        CordoReplies.activeInteractionReplyContexts.push(context)
        setTimeout(() => CordoReplies.activeInteractionReplyContexts.splice(0, 1), 15 * 60e3)
        return CordoReplies.getLevelTwoReplyState(context)
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

        if (!Cordo._data.uiStates[state]) {
          Cordo._data.logger.warn(`Component ${i.data.custom_id} tried to apply state non-existent ${state}`)
          return
        }

        let data = Cordo._data.uiStates[state](i, args)
        if ((data as any).then) data = await data
        CordoAPI.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, data as InteractionApplicationCommandCallbackData)
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
        }, true)
      },
      async state(state?: string, ...args: any) {
        if (!state) state = context.interaction.id

        if (!Cordo._data.uiStates[state]) {
          Cordo._data.logger.warn(`Janitor tried to apply state non-existent ${state}`)
          return
        }

        let data = Cordo._data.uiStates[state](context.interaction, args)
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
          return {} as any
        }

        context.timeout = timeout
        context.onInteraction = options?.onInteraction
        context.timeoutRunFunc = () => {
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
        context.handlers[customId] = handler
        if (customId.includes('$')) {
          context.slottedHandlers.push({
            id: customId,
            regex: new RegExp(customId.replace(/\$[a-zA-Z0-9]+/g, '[a-zA-Z0-9]+')),
            handler
          })
        }
        return state
      }
    }
    return state
  }

}
