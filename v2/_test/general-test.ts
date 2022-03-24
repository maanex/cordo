import { InteractionComponentFlag } from "../../src/types/const"
import button from "../components/buttons"

const b1 = button({
  label: 'hi',
  style: 'BLUE',
  customId: 'hi',
  disabled: true
})

const b2 = button('https://abc', 'hi', false)

const b3 = button('coolid', { id: '1234123' }, 'BLUE', false, InteractionComponentFlag.ACCESS_ADMIN)
