# Commands

## What it is

The `defineCordoCommand` function is used to declare Discord Application Commands (Slash Commands, User Context Menus, and Message Context Menus) directly within your Cordo application. 

Instead of maintaining a separate registry of commands and their route targets, you define the command's metadata (name, description, options, permissions) right alongside the route that executes it.

## How it works

When you define a command, you export it as the default export of a file in your `routes` directory, wrapping your route handler:

```ts
// src/routes/command/lookup.ts
import { defineCordoCommand, defineCordoRoute } from 'cordo/core'
import { text } from 'cordo/components'

// 1. Define the actual route handler
const route = defineCordoRoute((i) => {
  const query = i.command.options.query
  i.render(text(`You searched for: ${query}`))
})

// 2. Export the command definition, attaching the route to it
export default defineCordoCommand({
  type: 'chat', // A slash command
  name: 'lookup',
  description: 'Look up a user or product in the database',
  options: [
    {
      type: 'string',
      name: 'query',
      description: 'The ID to search for',
      required: true
    }
  ],
  route // Attach the route defined above
})
```

When `Cordo.mountCordo()` scans your routing tree, it looks for any file exporting a `CordoCommand`. 
- Cordo's **Router** unwraps the object, finding the attached `route` handler, and registers it so it can be executed.
- Cordo's **Command Sync** (`Cordo.syncCommands()`) reads the metadata (`type`, `name`, `options`) and registers the command with Discord's API. 

> [!IMPORTANT]
> To use `Cordo.syncCommands()`, you must configure `client.token` in your `cordo.config.ts`. Cordo requires your bot token to authenticate the API request that registers the commands to Discord.

## What it can do

The `defineCordoCommand` object accepts the following options:

- `type`: The type of command (`'chat'` for Slash Commands, `'user'` for User Context Menus, `'message'` for Message Context Menus).
- `name`: The name of the command. Can be a string or a localized object.
- `description`: The description of the command (only valid for `'chat'` type).
- `options`: An array of options/arguments the user must provide (e.g. strings, integers, user mentions).
- `defaultMemberPermissions`: A bitfield of permissions required to use the command by default.
- `nsfw`: Marks the command as age-restricted.
- `limitInstallTypes`: Limits where the command can be installed (`'guild'` or `'user'`).
- `limitContexts`: Limits where the command can be used (`'guild'`, `'dm'`, or `'group'`).
- `private`: If `true`, the resulting interaction will be automatically marked as ephemeral (private).
- `route`: The `CordoRoute` handler to execute when the command is invoked.

## Command Options

Options in the `options` array configure the arguments users provide when running a chat command.

Supported option types:
- `'string'`: Text input. Supports `minLength`, `maxLength`, and `choices`.
- `'integer'`: Whole numbers. Supports `minValue`, `maxValue`, and `choices`.
- `'number'`: Floating-point numbers. Supports `minValue`, `maxValue`, and `choices`.
- `'boolean'`: True or false toggle.
- `'user'`: User mention.
- `'channel'`: Channel mention. Supports filtering by `channelTypes`.
- `'role'`: Role mention.
- `'mentionable'`: Any mentionable entity (users, roles).
- `'attachment'`: File attachment. Supports filtering by `fileTypes` (e.g. `['image', 'video']` or `['.json', '.png']`).

### Static Choices

For `'string'`, `'integer'`, or `'number'` options, you can provide a predefined list of static choices:

```ts
{
  type: 'string',
  name: 'difficulty',
  description: 'Select difficulty level',
  required: true,
  choices: [
    { name: 'Easy', value: 'easy' },
    { name: 'Medium', value: 'medium' },
    { name: 'Hard', value: 'hard' }
  ]
}
```

## Autocomplete

Instead of static choices, you can provide dynamic choices in real-time as the user types by providing a function to `choices`.

### Defining an Autocomplete Handler

Assign an async or synchronous function to the option's `choices` property:

```ts
// src/routes/command/search.ts
import { defineCordoCommand, defineCordoRoute } from 'cordo/core'
import { text } from 'cordo/components'

const route = defineCordoRoute((i) => {
  const selectedTag = i.command.options.tag
  i.render(text(`Selected tag: ${selectedTag}`))
})

export default defineCordoCommand({
  type: 'chat',
  name: 'search',
  description: 'Search documentation tags',
  options: [
    {
      type: 'string',
      name: 'tag',
      description: 'The tag to search for',
      required: true,
      choices: async (query, i) => {
        // query is the string or number currently typed by the user
        // i is the CordoInteraction context (i.guildId, i.locale, i.user, etc.)
        const tags = ['routing', 'components', 'interactions', 'localization', 'error-handling']

        const matching = tags.filter(tag => tag.toLowerCase().includes(query.toLowerCase()))

        // Return up to 25 choices
        return matching.slice(0, 25).map(tag => ({
          name: tag,
          value: tag
        }))
      }
    }
  ],
  route
})
```

### How it Works

1. **Automatic Discord Configuration**: When syncing commands (`Cordo.syncCommands()`), Cordo detects that `choices` is a function, omits static choices, and registers the option with `autocomplete: true` on Discord.
2. **Transparent Routing**: When a user types in Discord, Discord dispatches an `ApplicationCommandAutocomplete` interaction. Cordo identifies the target command route, locates the focused option, and invokes your autocomplete function.
3. **Response Formatting**: Cordo sends the returned array back to Discord as an autocomplete result. Discord allows a maximum of 25 choices.

### Handler Signature

```ts
(
  value: string | number,
  i: CordoInteraction
) => Array<{ name: string | LocalizedString, value: string | number }> | Promise<Array<{ name: string | LocalizedString, value: string | number }>>
```

- **`value`**: The current value entered by the user for the focused option (`string` or `number`).
- **`i`**: The `CordoInteraction` instance, providing access to `i.user`, `i.guildId`, `i.locale`, etc.
- **Return Value**: An array (or Promise resolving to an array) of `{ name, value }` objects.

### Localized Choice Names

Choice names can be localized using a dictionary mapping locale codes to strings. Cordo will automatically pick the translation matching the user's `i.locale` (with fallback to `'en-US'` or the first available key):

```ts
choices: (query, i) => [
  {
    name: {
      'en-US': 'Apple',
      'de': 'Apfel',
      'fr': 'Pomme'
    },
    value: 'apple'
  },
  {
    name: {
      'en-US': 'Orange',
      'de': 'Orange',
      'fr': 'Orange'
    },
    value: 'orange'
  }
]
```

### Reusable Autocomplete Handlers

Autocomplete functions can be defined separately and reused across multiple commands:

```ts
// src/utils/autocompletes.ts
import { searchDatabase } from '../lib/db'

export async function countryAutocomplete(query: string) {
  const countries = await searchDatabase('countries', query)
  return countries.map(c => ({ name: c.name, value: c.code }))
}
```

```ts
// src/routes/command/shipping.ts
import { defineCordoCommand, defineCordoRoute } from 'cordo/core'
import { countryAutocomplete } from '../../utils/autocompletes'

export default defineCordoCommand({
  type: 'chat',
  name: 'shipping',
  description: 'Calculate shipping costs',
  options: [
    {
      type: 'string',
      name: 'country',
      description: 'Destination country',
      required: true,
      choices: countryAutocomplete
    }
  ],
  route: defineCordoRoute((i) => { /* ... */ })
})
```
