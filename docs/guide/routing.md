# File Based Routing

For each interaction flow, Cordo keeps track of a "route"—the Discord app equivalent of a web URL. Everything you do with Cordo revolves around navigating to different routes.

## The Entry Points (`command/`)

As an entry point, your application will always use `command/...` routes.

- A slash command `/foo` uses the route `command/foo` (and its handler lives at `routes/command/foo.ts`).
- A slash command with a subcommand `/foo bar` uses the route `command/foo/bar` (`routes/command/foo/bar.ts`).
- Context commands are converted to lowercase, spaces replaced with `-`, and all other non-word characters removed. For example: `Add user :3` becomes the route `command/add-user-3`.

*(Advanced: You can use the `transformCommandName` hook in your `cordo.config.ts` to implement custom logic for entry point routing.)*

## Route Parameters

You can capture dynamic data in your routes using parameter brackets `[paramName]`. 

For example:
- `routes/profile/[userid]/index.ts` matches `profile/12345678`
- `routes/profile/[userid]/friendlist.ts` matches `profile/12345678/friendlist`

Inside the route handler, you access these parameters via `i.params`:

```ts
import { defineCordoRoute } from 'cordo/core'
import { text } from 'cordo/components'

export default defineCordoRoute((i) => {
  const userId = i.params.userid
  
  i.render(
    text(`Viewing profile for user ID: ${userId}`)
  )
})
```

A single `[parameter]` captures a single string until the end of the route string or until the next forward slash.

## Changing Routes

There are two primary ways you will switch routes in Cordo.

### 1. Route-Level Redirects

You can redirect directly upon calling a route. This is incredibly useful for conditional access (like admin panels) or routing legacy commands to their new homes.

```ts
import { defineCordoRoute } from 'cordo/core'

export default defineCordoRoute((i) => {
  // If user is not an admin, boot them to a generic error or home route
  if (!isAdmin(i.user)) {
    return i.goto('error/unauthorized')
  }

  // Admin rendering logic here...
})
```

### 2. In Response to User Input

For interactable components (like Buttons or Select Menus), you can define a list of "Functs" (special micro-functions) to execute when the component is clicked. 

Cordo uses `goto` to execute a route change:

```ts
import { defineCordoRoute } from 'cordo/core'
import { button, text } from 'cordo/components'
import { goto } from 'cordo/functions'

export default defineCordoRoute((i) => {
  i.render(
    text('Would you like to see more?'),
    button()
      .label('See more')
      .onClick(goto('./more-details'))
  )
})
```

> [!TIP]
> **Relative Paths:**
> All routes in Cordo support relative paths! You can use `absolute/routes`, `./relative`, and `../upwards` just like you're used to from a filesystem.

## Ignored Files

Any `.ts` file starting with an underscore (`_`) is ignored by the Cordo router. You can use these files for hosting utilities or shared components directly beside your routes.

## Error Boundaries

If an error is thrown during a route handler, Cordo leverages Error Boundaries (`error.ts` files) to catch it. The framework traverses upwards through your directory tree to find the nearest boundary to safely handle the exception.

For detailed information on how to define these files and handle errors gracefully, see the **[Error Boundaries Reference](/reference/error-boundary.md)**.
