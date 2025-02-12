import { button, row, text } from "../../../../../src/components"
import { debugRoute } from "../../../../../src/components/mods/debug-route"
import { defineCordoRoute } from "../../../../../src/core"
import { goto } from "../../../../../src/core/funct"


export default defineCordoRoute(({ params }) => [
  text(JSON.stringify(params)),
  row(
    button()
      .label('Up twice!')
      .onClick(goto('../..')),
    button()
      .label('Up x3')
      .onClick(goto('../../..'))
  ),
  debugRoute()
])
