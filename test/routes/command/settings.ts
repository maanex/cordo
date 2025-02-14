import { button, container, divider, row, section, selectString, spacer, text } from "../../../src/components"
import { debugRoute } from "../../../src/components/mods/debug-route"
import { defineCordoRoute } from "../../../src/core"
import { goto } from "../../../src/core/funct"


export default defineCordoRoute(() => {

  const overview = container(
    text('FreeStuff Premium', '✤').size('h3'),
    text('Welcome to FreeStuff!'),
    divider().size('large'),
    section(text('100% Discount')).decorate(button().label('Edit')),
    section(text('Free Weekend')).decorate(button().label('Edit')),
    section(text('DLCs & More')).decorate(button().label('Edit'))
  )

  return [
    overview,
    selectString()
      .addOption({ label: '100% Off (2)', value: 'keep', emoji: { id: '1196056221019545692', name: 's' } })
      .addOption({ label: 'Free Weekend (1)', value: 'timed', emoji: { id: '1196056219610259587', name: 's' } })
      .addOption({ label: 'DLCs & More (1)', value: 'other', emoji: { id: '1196056223326404768', name: 's' } }),
    debugRoute()
  ]
})
