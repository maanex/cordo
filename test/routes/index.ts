import { button, container, row, text } from "../../src/components"
import { defineCordoRoute } from "../../src/core"
import { goto } from "../../src/core/funct"


export default defineCordoRoute(({ fullRoute }) => {

  const button1 = button()
    .label('clicker')
    .style('success')
    .onClick(goto('command/settings'))

  const random = ~~(Math.random() * 1000)
  const button2 = button()
    .label('This goes to ' + random)
    .style('danger')
    .onClick(goto(`nested/${random}`))

  const button3 = button()
    .label('This goes deeeeeep')
    .style('danger')
    .onClick(goto(`nested/${~~(Math.random() * 1000)}/owouwu/${(~~(Math.random() * 801294419283)).toString(34)}`))

  return [
    container(
      text('HOMEPAGE').size("h1"),
      row(button1, button2),
      row(button3)
    ),
    text(fullRoute).size('small')
  ]
})
