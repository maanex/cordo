import { FunctInternals, type CordoFunct } from "../funct"


/** value will do as you think and just encode a value
 * this is mostly used internally and you should not need to use this
 */
export function value(
  value: string,
): CordoFunct<'value'> {
  return FunctInternals.createFunct({
    type: 'value',
    path: value,
    flags: 0
  })
}
