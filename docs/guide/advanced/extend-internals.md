# Extending Internals

Cordo abstracts away much of Discord's raw API, but sometimes you need to dig under the hood. Cordo exports various `Extend` namespaces containing powerful internal utilities.

## `Extend.runInCordoContext`

Cordo heavily relies on AsyncLocalStorage to keep track of the current interaction context without passing it explicitly to every function. If you are doing advanced asynchronous work or spawning background tasks that need to act as if they were running inside a route, you can wrap them in this context.

```ts
import { Extend } from 'cordo/core'
import { CordoInteraction } from 'cordo/core'

function backgroundWorker(interaction: CordoInteraction) {
  Extend.runInCordoContext(() => {
    // Inside this callback, all of Cordo's internal state management
    // (like custom_id compression, locale handling, etc.) will work 
    // as if it was running inside a normal route handler.
  }, {
    invoker: interaction
  })
}
```

## Component Compilation

If you are building complex wrappers, you might need to convert Cordo's declarative component trees back into Discord's raw JSON component structure manually.

```ts
import { Extend } from 'cordo/components'

// Takes a CordoComponent tree and compiles it into Discord API JSON
const rawComponents = Extend.renderComponent(myComponentTree, null, [], {})
```

## Funct ID Compression

Cordo's lockfile compresses route paths down to a 3-character ID to fit within Discord's `custom_id` limit. If you are building custom `CordoComponent` wrappers or interacting with raw interactions, you might need to compress or parse these IDs manually.

```ts
import { Extend } from 'cordo/functions'

// Compressing a Funct to a string ID
// e.g. "goto('settings')" -> "b00" (or whatever ID is in the lockfile)
const compressedId = Extend.toCustomId(goto('settings'))

// Parsing a compressed string ID back into its Functs and values
const parsed = Extend.parseCustomId(compressedId)
```
