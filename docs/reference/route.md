# Route Handlers

## What it is

A Route Handler is the fundamental building block of a Cordo application. It maps a specific "route" (like `command/ping` or `settings/notifications`) to a function that executes whenever that route is invoked by a user interaction. 

## How it works

Cordo uses File-Based Routing. The location of the file within your `routes` directory determines the route's name. Every valid route file must `export default` the result of `defineCordoRoute()`.

When a route is triggered, Cordo passes a `CordoInteraction` object (`i`) into your handler. This object contains all the context about the user, the Discord server, the parameters, and methods to respond to the interaction.

## What it can do

A route handler can do two primary things:

### 1. Render Chat UI
It can call `i.render(...)` to send a visual response back to the channel.

```ts
import { defineCordoRoute } from 'cordo/core'
import { text } from 'cordo/components'

export default defineCordoRoute((i) => {
  i.render(
    text('Hello, world!')
  )
})
```

### 2. Open Modals
It can call `i.prompt(...)` to open a modal popup on the user's screen (for collecting text input).

```ts
import { defineCordoRoute } from 'cordo/core'
import { modal, textInput } from 'cordo/components'

export default defineCordoRoute((i) => {
  i.prompt(
    modal(
      textInput().as('feedback').withLabel('Your feedback')
    ).title('Feedback Form')
  )
})
```

### 3. Perform Headless Logic
It can perform background logic without rendering anything. This is often used with the `run()` funct to mutate state.

```ts
import { defineCordoRoute } from 'cordo/core'

export default defineCordoRoute(async (i) => {
  // Fetch data from database
  const user = await db.getUser(i.user.id)
  
  // Attach data to locals for the next route to read
  i.locals.set('userData', user)
})
```
