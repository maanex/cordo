// import { InteractionComponentFlag } from "../../types/const"
// import button from "../components/button-component"
// import { Interaction } from "../interactions/$interaction"
// import { Const } from "../types/const"

import { Interaction } from "../interactions/$interaction"

// const b1 = button({
//   label: 'hi',
//   style: 'BLUE',
//   customId: 'hi',
//   disabled: true
// })

// const b2 = button('https://abc', 'hi', false)

// const b3 = button('coolid', { id: '1234123' }, 'BLUE', false, InteractionComponentFlag.ACCESS_ADMIN)


// const interaction: Interaction<Const.InteractionType.COMMAND> = null
// interaction.data.


const i1: Interaction<'COMMAND'> = null as any
i1.defer(true)

const i2: Interaction<'COMPONENT'> = null as any
i2.applyState('pog', { gaming: true })

const i3: Interaction<'COMMAND_AUTOCOMPLETE'> = null as any
i3.show([ { name: 'hi', value: 'pog' } ])

const i4: Interaction<'MODAL_SUBMIT'> = null as any
i4.reply({ content: 'nice' })
