import { button, row, text } from "../../../src/components"
import { defineCordoRoute } from "../../../src/core"
import { goto } from "../../../src/core/funct"


export default defineCordoRoute(({ fullRoute }) => [
  row(
    button()
      .label('Up again!')
      .onClick(
        // run('./cool2', { wait: true }),
        // run('./cool'),
        // goto('nested/cool/inner', { private: true, reply: true })
        goto('..')
      )
  ),
  text(fullRoute).size('small')
])
