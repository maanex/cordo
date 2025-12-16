# Cordo

Cordo is a developer-experience-first Discord App and UI library for TypeScript.

Cordo is built for and used in production with over 700k discord servers at https://freestuffbot.xyz/.


## Concepts

Cordo is taking inspiration from modern web-frameworks with concepts like **File Based Routing**, **Composables**, and **Error Boundaries**.

Cordo is also completely stateless allowing for incredibly easy load balancing, super light ram usage, and more. (This doesn't mean your bot cannot have state. It very well can.)

Cordo also abstracts away a lot of constraints/burdens on Discord's interactions api like completely hiding and managing *custom_id*s and automatically laying out components into rows or labels.

Cordo can be run as a standalone web-server (recommended) or integrated into existing Discord api libraries like discord.js.


## Quick Start

### 1. Install via bun

`bun add cordo`

<details>
<summary>Other runtimes</summary>

Cordo should also be able to run on Deno.

Cordo should also be able to run on Node with experimental native TypeScript support enabled.

> [!NOTE]
> The `plugin/hono` package uses Bun specific apis. This should not be an issue since the package must be explicitly imported but keep it in mind if you use hono in a non-bun environment.
</details>


### 2. Add to your project

First you need to mount cordo by running `await Cordo.mountCordo()`. This step reads the cordo config and lock files and enables the file tree searching.

Second you need to pass incoming events to cordo, depending on the rest of your project this might look slightly different:

<details>
<summary>Using express (http)</summary>

```ts
import { useWithExpress } from 'cordo/plugin/express'
const app = express()
const clientPublicKey = 'your discord public key'
app.use(useWithExpress(clientPublicKey))
app.listen(5058, () => console.log('Cordo is running on port 5058'))
```
</details>

<details>
<summary>Using hono (http)</summary>

```ts
import { useWithHono } from 'cordo/plugin/hono'
const app = new Hono()
const clientPublicKey = 'your discord public key'
app.use('/cordo', useWithHono(clientPublicKey))
return app
```
</details>

<details>
<summary>Using discord.js</summary>

```ts
import { useWithDiscordJs } from 'cordo/plugin/djs'
const client = new Client({ ... })
useWithDiscordJs(client)
client.login()
```
</details>

<details>
<summary>Manually triggering (not recommended)</summary>

```ts
// Pass the raw body as a node buffer:
Cordo.triggerInteraction(req.body, {
  // The httpCallback, if provided, is called on the first response to the interaction. Use this if you are receiving events via http, omit otherwise.
  httpCallback: (payload: any) => res.status(200).json(payload)
})
```
</details>

### 3. Create cordo.config.ts

This is your primary configuration file. You can use the example from below as a starting point.

```ts
import { defineCordoConfig } from 'cordo/core'


export default defineCordoConfig({
  // the root directory for cordo to search through
	rootDir: './src',
  // the file for cordo to store the generated types
	typeDest: './src/types/cordo.ts',
	client: {
    // your app's id
		id: '123456789'
	}
})
```

### 4. Create your first route

1. Create a folder called `routes` inside your rootDir.
2. Create a folder called `command` inside the routes folder.
3. Create a file named after your slash command inside the command folder.
4. Export a cordo route handler as the default export:

```ts

export default defineCordoRoute((i) => {
	i.render(
    text('My first command')
  )
})
```

## Concepts

### File based routing

For each interaction flow cordo is keeping track of a route, the webdev equivalent of a url. This means everything you do with cordo revolves around navigating to different routes.

As an entry point you will always have `command/...` routes.
- A slash command `/foo` will have the route `command/foo` (and it's handler at `routes/command/foo.ts`)
- A slash command with subcommand `/foo bar` will have the route `command/foo/bar`
- Context commands are converted to lowercase, spaces replaced with `-` and all other non-word characters removed. Example: `Add user :3` will have the route `command/add-user-3`
- Advanced: You can use the `transformCommandName` hook in your cordo.config to use custom logic

You will primarily use these two situations to switch routes:

#### 1. Route level redirects

You can redirect directly upon calling the route like so

```ts
export default defineCordoRoute((i) => {
	i.goto('my/route')
})
```

Which can be useful to route commands to their proper location. You can also use this to gate specific routes to specific conditions.

```ts
export default defineCordoRoute((i) => {
  if (!isAdmin(i.user)) {
	  return i.goto('my/route')
  }

  // or else...
})
```

#### 2. In response to user input

For all interactable components you can define a list of "functs" - which are special micro functions - to execute when the component is interacted with.

This includes buttons

```ts
i.render(
  button()
    .onClick(...)
)
```

Select menus

```ts
i.render(
  selectString()
    .addOption({
      label: 'test',
      onClick: [ ... ]
    })
)
```

And modals:

```ts
i.prompt(
  modal(...)
    .onClick(...)
)
```

The primary functs you will be using are run and goto.

`goto` does a route change and will navigate the user to the specified route.

```ts
i.render(
  button()
    .label('See more')
    .onClick(goto('./more'))
)
```

This is a good moment to mention that all routes support relative paths. You can use `absolute/routes`, `./relative`, and `../upwards` like you're used to from file systems.

`run` is similar to goto as it will execute the code in the location specified, yet it will not allow the route to render anything. You can use this paradigm to have purely functional routes and ones that serve ui.

```ts
i.render(
  button()
    .label('Save preferences')
    .onClick(
      run('utils/save-user-to-db', {
        wait: true,
        continueOnError: false
      }),
      goto('.')
    )
)
```

In this case we're running the route at `routes/utils/save-user-to-db.ts` and waiting for it to finish (this route might be async). If anything goes wrong we will abort and let the nearest error boundary handle it (we will get to this). Once done we will navigate to `.` which is the current route, forcing cordo to re-render the one we are at right now.

The function at `utils/save-user-to-db` might use "locals" to attach information to the interaction such that the current route can display the successful database save.

```ts
// routes/utils/save-user-to-db.ts
export default defineCordoRoute(await (i) => {
  try {
    // ... save to database ...

    // set a local variable
    i.locals.set('message', 'Successfully saved to database!')
  } catch (ex) {
    // this will abort the interaction and trigger an error boundary
    throw new CordoError('Database saving failed', ex.message)
  }
})
```

```ts
// current route
export default defineCordoRoute((i) => {
  i.render(
    // Retreive the message from locals
    text(`A message: ${i.locals.get('message')}`)
      // Only show if there is a message in the locals
      .visible(i.locals.has('message'))

    button()
      .label('Save preferences')
      .onClick(
        run('utils/save-user-to-db', {
          wait: true,
          continueOnError: false
        }),
        goto('.')
      )
  )
})
```

This approach might take a second to get used to but allows for some very powerful composability and is highly scaleable.

#### Parameters in routes

You can use parameters in your routes like so:

* `routes/profile/[userid]/index.ts` -> matches `profile/12345678`
* `routes/profile/[userid]/friendlist.ts` -> matches `profile/12345678/friendlist`
* `routes/profile/[userid]/friendlist/[friend].ts` -> matches `profile/12345678/friendlist/481279874192`

You can access params using `i.params`.

A single `[parameter]` only captures a single string until the end of the route string or until the next forward slash.

Cordo's routing does not allow routes to have `..` for navigating up anywhere besides the beginning of the route. This means you can safely use template strings in your routes if you prefix them with something.
- Good: `shop/category/${...}`
- Bad: `${...}/info`

`.ts` files starting with _ are ignored and can be used for hosting utilities.


### Oh yeah, error boundaries

If an error is thrown cordo will first check the folder of the file for the current route and check for a file called `error.ts` exporting `export default defineCordoErrorBoundary((error, req) => ...)`. If none is found it will go up one folder and repeat until the routes folder is left at which point cordo will use it's built-in error handler.

- The search starts at the folder of the file for the current route. This means if you trigger a different route using `run` the cwd is not changed and the error handler stays the same. If you use `goto` the cwd is changed to the new route and such is the error handler.
- An error handler can at any point `throw` the error again to escalate it to a higher up error handler.
- An error handler can handle the interaction just like a normal route handler including: accessing locals and re-routing to non-error routes.

