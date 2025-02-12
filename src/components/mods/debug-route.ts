import { InteractionEnvironment } from "../../core/interaction-environment"
import { text } from "../builtin/text"
import { readComponent } from "../component"
import { createModifier } from "../modifier"


export function debugRoute() {
  return createModifier({
    name: 'debug-route',
    hooks: {
      preRender: (c) => {
        const routeText = text(InteractionEnvironment.getCtx().currentRoute).size('small')
        return [ ...c, readComponent(routeText) ]
      },
    }
  })
}
