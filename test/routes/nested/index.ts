import { button, row } from "../../../src/components"
import { debugRoute } from "../../../src/components/mods/debug-route"
import { defineCordoRoute } from "../../../src/core"
import { goto } from "../../../src/core/funct"


export default defineCordoRoute([
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
  debugRoute()
])
