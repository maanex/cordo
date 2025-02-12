import { button, divider, row } from "../../src/components"
import { debugPrint } from "../../src/components/mods/debug-print"
import { debugRoute } from "../../src/components/mods/debug-route"
import { defineCordoRoute } from "../../src/core"
import { goto } from "../../src/core/funct"


export default defineCordoRoute(() => {

  return [
    button().label('Refresh').style('success').onClick(goto('.')),
    button(),
    button(),
    divider(),
    button().onClick(goto('.')).disabled(Math.random() < 0.5),
    button().onClick(goto('.')).disabled(Math.random() < 0.5),
    button().onClick(goto('.')).disabled(Math.random() < 0.5),
    button().onClick(goto('.')).disabled(Math.random() < 0.5),
    row(button().style('danger')),
    debugPrint(),
    debugRoute()
  ]
})
