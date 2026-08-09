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
