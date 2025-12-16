
import { createModifier as _createModifier } from './modifier'
import {
  createComponent as _createComponent,
  ComponentType as _ComponentType,
  readComponent as _readComponent,
  isComponent as _isComponent,
  renderComponent as _renderComponent,
  renderComponentList as _renderComponentList,
} from './component'

export { button } from './builtin/button'
export { container } from './builtin/container'
export { collection } from './builtin/collection'
export { divider } from './builtin/divider'
export { gallery } from './builtin/gallery'
export { image } from './builtin/image'
export { linkButton } from './builtin/link-button'
export { modal } from './builtin/modal'
export { row } from './builtin/row'
export { section } from './builtin/section'
export { selectString } from './builtin/select-string'
export { skuButton } from './builtin/sku-button'
export { spacer } from './builtin/spacer'
export { textInput } from './builtin/text-input'
export { text } from './builtin/text'

export { debugIdToLabel } from './mods/debug-id-to-label'
export { debugPrint } from './mods/debug-print'
export { debugRoute } from './mods/debug-route'
export { disableAllComponents } from './mods/disable-all-components'
export { enforcePrivateResponse } from './mods/enforce-private-response'

export type { CordoComponent, StringComponentType } from './component'

export namespace Extend {
  export const createModifier = _createModifier

  export const createComponent = _createComponent
  export const ComponentType = _ComponentType
  export const readComponent = _readComponent
  export const isComponent = _isComponent
  export const renderComponent = _renderComponent
  export const renderComponentList = _renderComponentList
}
