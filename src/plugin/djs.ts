import { Client, Events } from 'discord.js'
import { Cordo } from '../core'


export function useWithDiscordJs(client: Client) {
  if (!client)
    throw new Error('You must provide a discord.js client object');

  client.on(Events.Raw, (event) => {
    if (event.t === 'INTERACTION_CREATE')
      Cordo.triggerInteraction(event.d)
  })

  setTimeout(() => {
    if (client.listeners(Events.InteractionCreate).length)
      console.warn('You are using both the Cordo and Discord.js interaction listeners. This may cause issues with your routes.')
  }, 50)
}
