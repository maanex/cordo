import { button, container, row, text } from "../../../src/components"
import { defineCordoRoute } from "../../../src/core"
import { goto } from "../../../src/core/funct"


export default defineCordoRoute(({ fullRoute }) => {

  const button1 = button()
    .label('The Button')
    .style('primary')
    .onClick(goto('index'))

  return [
    container(
      text('Gamers!'),
      row(button1)
    ),
    text(fullRoute).size('small')
  ]
})
