import { button, container, row, text } from "../../../src/components"
import { debugRoute } from "../../../src/components/mods/debug-route"
import { defineCordoRoute } from "../../../src/core"
import { goto } from "../../../src/core/funct"


export default defineCordoRoute(() => {

  const button1 = button()
    .label('The Button')
    .emoji('<:new:814822710013984788>')
    .style('primary')
    .onClick(goto('index'))

  return [
    container(
      text('Gamers!'),
      row(button1)
    ),
    debugRoute()
  ]
})
