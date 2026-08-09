# Interactions & State

Because Cordo is entirely **stateless**, you need a way to pass data between routes and manage execution flow when users click buttons, submit modals, or change select menus. This is where "Functs" and "Locals" come into play.

## Functs (`goto` and `run`)

"Functs" are special micro-functions that you attach to interactive components. The two primary functs you'll use are `goto` and `run`.

### `goto(route, params?)`

`goto` performs a complete route change. It navigates the user to the specified route, changing the current working directory, and expects that new route to `i.render()` a new UI.

```ts
import { button } from 'cordo/components'
import { goto } from 'cordo/functions'

i.render(
  button()
    .label('Settings')
    .onClick(goto('command/settings'))
)
```

### `run(route, options?)`

`run` executes the code at a specific route *without* allowing that route to render UI or change the current working directory. You use this paradigm to create purely functional, headless routes that process data in the background.

```ts
import { button } from 'cordo/components'
import { run, goto } from 'cordo/functions'

i.render(
  button()
    .label('Save preferences')
    .onClick(
      run('utils/save-user-to-db', {
        wait: true, // Wait for this run to finish before continuing
        continueOnError: false
      }),
      goto('.') // Re-render the current route
    )
)
```

In this example, Cordo will execute `routes/utils/save-user-to-db.ts`. Once it's done, it will proceed to the next funct in the array (`goto('.')`), which re-renders the current page.

## Passing Data (Locals)

Since Cordo doesn't store state between interactions, how do you pass data from a headless `run` route back to the route that is rendering the UI? 

You use `i.locals`.

Locals are a temporary map attached to the *current interaction context*. They live only for the duration of the single interaction flow.

### Example Flow

**1. The Headless Processing Route (`routes/utils/save-user-to-db.ts`)**

```ts
import { defineCordoRoute, CordoError } from 'cordo/core'

export default defineCordoRoute(async (i) => {
  try {
    // ... imaginary database logic ...
    
    // Set a local variable to be read later in the chain
    i.locals.set('message', 'Successfully saved to database!')
  } catch (ex) {
    // If we throw, the rest of the funct chain aborts and an Error Boundary takes over
    throw new CordoError('Database saving failed', ex.message)
  }
})
```

**2. The UI Route**

```ts
import { defineCordoRoute } from 'cordo/core'
import { text, button } from 'cordo/components'
import { run, goto } from 'cordo/functions'

export default defineCordoRoute((i) => {
  i.render(
    // Retrieve the message from locals
    text(`Status: ${i.locals.get('message')}`)
      .visible(i.locals.has('message')),

    button()
      .label('Save preferences')
      .onClick(
        run('utils/save-user-to-db', { wait: true }),
        goto('.')
      )
  )
})
```

This recursive, composable approach allows you to break your bot down into highly testable, distinct files. One file handles processing, one file handles display, and they communicate via `i.locals`.
