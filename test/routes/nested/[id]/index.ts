import { button, row, text } from "../../../../src/components"
import { debugRoute } from "../../../../src/components/mods/debug-route"
import { defineCordoRoute } from "../../../../src/core"
import { goto } from "../../../../src/core/funct"


export default defineCordoRoute(({ params }) => [
  text(JSON.stringify(params)),
  row(
    button()
      .label('Up once!')
      .onClick(goto('..'))
  ),
  debugRoute()
])
