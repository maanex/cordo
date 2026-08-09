# Configuration Reference

Your `cordo.config.ts` file is the heart of your Cordo application. Beyond defining the root directories, it also allows you to configure global behavior for functional mutations and error handling.

## `functDefaultFlags`

When using "Functs" like `run()`, you can pass options to control how the execution behaves (e.g., `wait`, `continueOnError`). However, you might want a default behavior applied globally across your entire app.

You can set these defaults inside `cordo.config.ts` via the `functDefaultFlags` object.

```ts
import { defineCordoConfig } from 'cordo/core'

export default defineCordoConfig({
  rootDir: './src',
  typeDest: './src/types/cordo.ts',
  client: {
    id: '123456789'
  },
  
  functDefaultFlags: {
    run: {
      // By default, if a `run` route throws an error, make sure the 
      // resulting error message sent to the user is ephemeral (private).
      privateErrorMessage: true
    }
  }
})
```

By setting `privateErrorMessage: true`, you ensure that if a headless mutation fails (like a database save), the error boundary rendering the failure will only be visible to the user who clicked the button, rather than cluttering a public channel.

## Complete Configuration Example

Here is a full example combining `functDefaultFlags` with the `transformCommandName` hook (used to customize how Discord interaction names map to your `command/...` routes).

```ts
import { defineCordoConfig } from 'cordo/core'

export default defineCordoConfig({
  rootDir: './src',
  typeDest: './src/types/cordo.ts',
  
  client: {
    id: '123456789'
  },
  
  functDefaultFlags: {
    run: {
      privateErrorMessage: true,
      continueOnError: false
    }
  },
  
  hooks: {
    // Advanced: Intercept the raw command name and transform it before Cordo tries to route it
    transformCommandName: (name) => {
      // e.g. mapping "Admin Settings" context command to "admin-panel"
      if (name === 'Admin Settings') return 'admin-panel'
      return name
    }
  }
})
```
