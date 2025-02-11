import { button } from "../../../src/components"
import { defineCordoRoute } from "../../../src/core"
import { goto, run } from "../../../src/core/funct"


export default defineCordoRoute([
  button()
    .label('Hello')
    .emoji('👋')
    .onClick(
      run('./cool2', { wait: true }),
      // run('./cool'),
      // goto('nested/cool/inner', { private: true, reply: true })
    )
])
