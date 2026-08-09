# Localization (i18n)

In large, global bots, you often need to translate the UI strings into the user's preferred locale. Cordo natively supports intercepting all text rendered to users via the `transformUserFacingText` hook.

## The `transformUserFacingText` Hook

You can define this hook in the `Cordo.mountCordo()` configuration. It will intercept every string passed into components like `text()`, `.label()`, `.placeholder()`, etc., right before the component tree is compiled to JSON.

### Defining the Hook

```ts
import { Cordo } from 'cordo/core'
import { translateString } from './my-i18n-library'

await Cordo.mountCordo({
  hooks: {
    transformUserFacingText(value, context) {
      // 'value' is the string passed into the Cordo component.
      // 'context' contains the current interaction, which includes the user's locale.
      
      // We can use a custom prefix (e.g. '=') to denote translation keys
      if (value.startsWith('=')) {
        const key = value.substring(1)
        const userLocale = context.interaction?.locale || 'en-US'
        
        return translateString(key, userLocale)
      }
      
      // If it doesn't start with '=', just return the original string
      return value
    }
  }
})
```

### Using it in Components

Once configured, you can seamlessly pass translation keys directly into your UI routes without littering them with translation function calls.

```ts
import { defineCordoRoute } from 'cordo/core'
import { text, button } from 'cordo/components'

export default defineCordoRoute((i) => {
  i.render(
    // Evaluates to: "Welcome back!"
    text('=page_welcome_title').size('h1'),
    
    // Evaluates to: "Settings"
    button().label('=btn_settings') 
  )
})
```

This keeps your Cordo routes clean, readable, and perfectly separated from the complexities of your i18n implementation.
