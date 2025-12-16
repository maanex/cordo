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
import useWithExpress from 'cordo/plugin/express'
const app = express()
const clientPublicKey = 'your discord public key'
app.use(useWithExpress(clientPublicKey))
app.listen(5058, () => console.log('Cordo is running on port 5058'))
```
</details>

<details>
<summary>Using hono (http)</summary>
```ts
import useWithHono from 'cordo/plugin/hono'
const app = new Hono()
const clientPublicKey = 'your discord public key'
app.use('/cordo', useWithHono(clientPublicKey))
return app
```
</details>

<details>
<summary>Using discord.js</summary>
```ts
import useWithDiscordJs from 'cordo/plugin/djs'
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
