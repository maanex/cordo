import { button, text } from "../../../src/components"
import { container } from "../../../src/components/builtin/container"
import { divider } from "../../../src/components/builtin/divider"
import { linkButton } from "../../../src/components/builtin/link-button"
import { row } from "../../../src/components/builtin/row"
import { section } from "../../../src/components/builtin/section"
import { defineCordoRoute } from "../../../src/core"
import { goto, run } from "../../../src/core/funct"


export default defineCordoRoute(() => {

  const button1 = button()
    .label('Hello')
    .style('primary')

  const backButton = button()
    .label('< Back')
    .style('secondary')
    .onClick(goto('..'))

  return [
    container(
      text('Gamers!'),
      row(button1, backButton),
      divider().size('large'),
      section(
        text('Huhu').size('h1'),
        text('content goes here')
      ).decorate(linkButton('https://google.com')),
      row(button())
    )
  ]
})
