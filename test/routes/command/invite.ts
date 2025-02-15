import { button } from "../../../src/components"
import { defineCordoRoute } from "../../../src/core"

export default defineCordoRoute(async (i) => {
  i.ack()

  await new Promise(r => setTimeout(r, 1000))
  i.render(
    button().label('huhu')
  )

  await new Promise(r => setTimeout(r, 2000))

  i.goto('command/help', { disableComponents: true, asReply: true, private: true })

  await new Promise(r => setTimeout(r, 4000))
  return [
    button().label('that\'s it')
  ]
})