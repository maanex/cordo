# Buttons

Buttons are the primary way users interact with your Cordo application. 

## `button()`

Maps to Discord's **Button** (`Type 2`).

The standard clickable button. When clicked, it executes the Funct you assign to its `onClick` handler.

```ts
import { button } from 'cordo/components'
import { goto, run } from 'cordo/functions'

// Navigating to a new UI route
button()
  .label('Next Page')
  .style('primary')
  .onClick(goto('pages/page-2'))

// Running a headless mutation
button()
  .label('Delete Item')
  .style('danger')
  .onClick(run('actions/delete-item'))
```

**Modifiers**:
- `.label(text: string)`: The text displayed on the button.
- `.style(style: 'primary' | 'secondary' | 'success' | 'danger')`: The visual style of the button.
- `.emoji(emoji: string)`: An emoji to display next to the label.
- `.disabled(disabled?: boolean)`: Disables the button.
- `.onClick(funct: CordoFunct)`: The action to perform when clicked.

## `linkButton()`

Maps to Discord's **Button** (`Type 2`) with style `Link` (5).

A button that acts as a hyperlink. It does not trigger a Cordo route; it simply opens a URL in the user's browser.

```ts
import { linkButton } from 'cordo/components'

linkButton('https://freestuffbot.xyz')
  .label('Visit our Website')
  .emoji('🔗')
```

**Modifiers**:
- **URL**: Passed as the first argument: `linkButton(url)`.
- `.label(text: string)`
- `.emoji(emoji: string)`
- `.disabled(disabled?: boolean)`

## `skuButton()`

Maps to Discord's **Button** (`Type 2`) with style `Premium` (6).

A specialized button used for Discord's Premium App Subscriptions (monetization). When clicked, it opens Discord's native purchase flow for the specified SKU.

```ts
import { skuButton } from 'cordo/components'

skuButton('123456789012345678')
```

**Modifiers**:
- **SKU ID**: Passed as the first argument: `skuButton(skuId)`.
- *Note: SKU buttons cannot have custom labels, styles, or emojis, as Discord enforces its own native UI for them.*
