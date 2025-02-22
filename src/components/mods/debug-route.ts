import { CordoMagic } from "../../core/magic"
import { text } from "../builtin/text"
import { readComponent } from "../component"
import { createModifier } from "../modifier"


export function debugRoute() {
  return createModifier({
    name: 'debug-route',
    hooks: {
      preRender: (c) => {
        const routeText = text(CordoMagic.getCwd()).size('small')
        return [ ...c, readComponent(routeText) ]
      },
    }
  })
}
