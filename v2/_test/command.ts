import { button } from "../components/button-component"
import { select } from "../components/select-component"
import { Interaction } from "../interactions/$interaction"


export default function handle(i: Interaction<'COMMAND'>) {
  i
    .replyInteractive({
      content: 'gaming',
      components: [
        button({
          customId: 'hi',
          label: 'Gaming'
        }),
        button({
          customId: 'hi2',
          label: 'Gaming'
        }),
        select({
          customId: 'pick_channels',
          options: 'CHANNELS'
        }),
        select({
          customId: 'pick_custom',
          options: [
            { label: 'hi', value: 'gaming' },
            { label: 'pog', value: 'nice' }
          ]
        })
      ]
    })
    .withTimeout(
      2000,
      j => j.disableComponents(),
      { onInteraction: 'removeTimeout' }
    )
    .on('hi', (i: Interaction<'COMPONENT'>) => {
      i.edit({
        components: [
          button('gaming', 'hi'),
          button.link('https://gaming', 'Gaming'),
          select.users('nice')
        ]
      })
    })
    .on('hi2', () => {})
}
