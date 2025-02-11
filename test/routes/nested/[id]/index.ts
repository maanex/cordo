import { button, row, text } from "../../../../src/components"
import { defineCordoRoute } from "../../../../src/core"
import { goto } from "../../../../src/core/funct"


export default defineCordoRoute(({ params, fullRoute }) => [
  text(JSON.stringify(params)),
  row(
    button()
      .label('Up once!')
      .onClick(goto('..'))
  ),
  text(fullRoute).size('small')
])
