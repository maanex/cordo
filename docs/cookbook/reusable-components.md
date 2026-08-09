# Reusable Components

Since Cordo's components are highly composable and strongly typed, creating your own wrappers is highly encouraged to keep your codebase DRY (Don't Repeat Yourself) and maintain a consistent design system.

## The "Back" Button

A very common pattern in multi-menu bots is a "Back" button that simply navigates one layer up in the routing tree. Instead of writing this button out every time, you can define a reusable component.

```ts
// src/components/back-button.ts
import type { DynamicTypes } from 'cordo'
import type { CordoComponent } from 'cordo/components'
import { button } from 'cordo/components'
import { goto } from 'cordo/functions'

export const backButton = (disabled = false, path?: DynamicTypes['Route']): CordoComponent<'Button'> => 
  button()
    .style('secondary')
    .label('Back')
    // .emoji('⬅️') // Optional: add an emoji
    .disabled(disabled)
    .onClick(goto(path ?? '..')) // Defaults to navigating one directory up
```

**Usage:**

```ts
import { defineCordoRoute } from 'cordo/core'
import { container, text } from 'cordo/components'
import { backButton } from '../../components/back-button'

export default defineCordoRoute((i) => {
  i.render(
    container(
      text('Advanced Settings Panel')
    ),
    
    // Automatically navigates to the parent route when clicked
    backButton()
  )
})
```
