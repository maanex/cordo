import { button, container, divider, linkButton, row, spacer, text } from "../../../src/components"
import { debugRoute } from "../../../src/components/mods/debug-route"
import { defineCordoRoute } from "../../../src/core"
import { goto } from "../../../src/core/funct"


export default defineCordoRoute([
  container(
    text('The FreeStuff bot keeps you up to date with free games!').size('h3'),
    text(
      '* Use </free:1221919085697302549> to get a list of free games',
      '\n* Use </settings:1221919098129354862> to configure the bot and to subscribe to free games notifications'
    ),

    spacer().size('small'),
    linkButton('https://discord.gg/WrnKKF8').label('Support'),
    linkButton('https://discord.com/oauth2/authorize?redirect_uri=https%3A%2F%2Ffreestuffbot.xyz%2Fcallback&client_id=672822334641537041&permissions=537316416&scope=bot%20applications.commands&response_type=code').label('Invite the bot')
  ),
  button()
    .label('Bot Settings')
    .style('primary')
    .onClick(goto('command/settings')),
  button()
    .label('About')
    .style('primary')
    .onClick(goto('command/about')),
])
