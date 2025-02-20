import { text } from "../../../src/components"
import { defineCordoRoute } from "../../../src/core"

export default defineCordoRoute((i) => {
  const content = JSON.stringify({...i, interaction: undefined}, null, 2)
  return [
    text(content).codeBlock('json')
  ]
})