import { button, row, text } from "../../../../../src/components"
import { defineCordoRoute } from "../../../../../src/core"
import { goto } from "../../../../../src/core/funct"


export default defineCordoRoute(({ params, fullRoute }) => [
  text(JSON.stringify(params)),
  row(
    button()
      .label('Up twice!')
      .onClick(goto('../..')),
    button()
      .label('Up x3')
      .onClick(goto('../../..'))
  ),
  text(fullRoute).size('small')
])
