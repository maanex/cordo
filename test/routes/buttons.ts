import { button, divider, row } from "../../src/components"
import { debugRoute } from "../../src/components/mods/debug-route"
import { defineCordoRoute } from "../../src/core"
import { goto } from "../../src/core/funct"


export default defineCordoRoute(() => {

  return [
    button().label('Refresh').style('success').onClick(goto('.')),
    button(),
    button(),
    divider(),
    button().disabled(Math.random() < 0.5),
    button().disabled(Math.random() < 0.5),
    button().disabled(Math.random() < 0.5),
    button().disabled(Math.random() < 0.5),
    row(button().style('danger')),
    debugRoute()
  ]
})
