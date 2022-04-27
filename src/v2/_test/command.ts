import { button } from "../components/button-component"
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
          button.link('https://gaming', 'Gaming')
        ]
      })
    })
    .on('hi2', () => {})
}
