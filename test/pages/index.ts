import { button } from "../../src/components"
import { defineCordoRoute } from "../../src/core"


export default defineCordoRoute([
  button()
    .label('Hello')
    .emoji('👋')
])
