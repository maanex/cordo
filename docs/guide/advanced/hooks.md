# Lifecycle Hooks

Cordo provides global lifecycle hooks in `cordo.config.ts` that allow you to intercept and modify interactions at various stages of their lifecycle.

## Overview of Hooks

You can define these in the `hooks` object when mounting Cordo:

- **`onRawInteraction`**: Called the moment an interaction is received via HTTP, before Cordo does any parsing.
- **`onBeforeHandle`**: Called after parsing, right before routing begins. Useful for kill-switches or global permissions.
- **`onBeforeRespond`**: Called right before a JSON payload is returned to the HTTP framework or sent directly to Discord's API.
- **`onAfterRespond`**: Called with the `AxiosResponse` of outgoing API calls.
- **`onNetworkError`**: Called when outgoing API calls fail.
- **`transformCommandName`**: Intercepts the raw command name (from Discord) and transforms it into a route string.
- **`transformUserFacingText`**: Intercepts all text rendered in UI components.
- **`captureUnroutableErrors`**: Captures errors that occurred outside of a valid routing context.
- **`captureUnhandledErrors`**: Captures errors that bubbled up past the root `routes` folder without hitting an `error.ts` boundary.

## The `onBeforeHandle` Hook

The `onBeforeHandle` function receives every incoming interaction. 

If this function returns:
- **`null`**: Cordo will completely abort handling the interaction. This implies you have handled the response yourself (or intentionally ignored it).
- **`CordoInteraction`**: Cordo will proceed to route the interaction as normal.

### Example: Global Kill-Switches

If you are performing database maintenance, you can intercept the interaction and return a friendly error message instead of letting it fail downstream.

```ts
import { Cordo, type CordoInteraction } from 'cordo/core'
import { container, text, Extend } from 'cordo/components'
import { InteractionResponseType } from 'discord-api-types/v10'

// A helper to forcefully respond to an interaction and abort Cordo's routing
function abortWithMessage(i: CordoInteraction, message: string) {
  const componentTree = container(text(message))
  
  Cordo.respondToRawInteraction(i, {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      flags: 64, // Ephemeral (private message)
      components: [
        // Extend.renderComponent parses the Cordo component tree into Discord's raw JSON format
        Extend.renderComponent(componentTree, null, [], {})
      ]
    }
  })
  
  return null // Tell Cordo to stop routing this interaction
}

export function onBeforeHandle(i: CordoInteraction) {
  const isMaintenanceMode = checkDatabaseMaintenanceFlag()
  
  if (isMaintenanceMode) {
    return abortWithMessage(i, 'The bot is currently undergoing maintenance. Please try again later!')
  }
  
  // Proceed normally
  return i
}
```
