# Getting Started

Cordo is a developer-experience-first Discord App and UI library for TypeScript. It is completely stateless, making it incredibly easy to load balance, scale, and maintain with very low memory footprints.

It is built around concepts similar to modern web frameworks:
- **File Based Routing**
- **Composables**
- **Error Boundaries**

## Installation

Install the package via npm, bun, or yarn:

```bash
npm install cordo
# or
bun add cordo
```

## Adding Cordo to Your Project

Before using Cordo, you must mount it to enable file-tree searching and configuration loading:

```ts
import { Cordo } from 'cordo/core'

await Cordo.mountCordo()
```

Next, you need to pass incoming events to Cordo. Depending on your backend/framework, this might look different.

### Using Express (HTTP)

```ts
import express from 'express'
import { useWithExpress } from 'cordo/plugin/express'

const app = express()
const clientPublicKey = 'your-discord-public-key'

app.use(useWithExpress(clientPublicKey))
app.listen(5058, () => console.log('Cordo is running on port 5058'))
```

### Using Hono (HTTP)

```ts
import { Hono } from 'hono'
import { useWithHono } from 'cordo/plugin/hono'

const app = new Hono()
const clientPublicKey = 'your-discord-public-key'

app.use('/cordo', useWithHono(clientPublicKey))

export default app
```

### Using Discord.js

```ts
import { Client } from 'discord.js'
import { useWithDiscordJs } from 'cordo/plugin/djs'

const client = new Client({ intents: [] })
useWithDiscordJs(client)

client.login('your-bot-token')
```

## Configuration

Your primary configuration file is `cordo.config.ts`. Place it in the root of your project:

```ts
import { defineCordoConfig } from 'cordo/core'

export default defineCordoConfig({
  paths: {
    // The root directory for Cordo to search for routes
    root: './src',
    // Where Cordo should store the generated TypeScript types
    types: './src/types/cordo.ts'
  },
  client: {
    // Your Discord App ID
    id: '123456789',
    publicKey: 'your-discord-public-key'
  }
})
```

## Your First Route

1. Create a `routes` folder inside your `rootDir` (e.g., `src/routes`).
2. Inside `routes`, create a `command` folder (`src/routes/command`).
3. Create a file named after your slash command (e.g., `ping.ts`).
4. Export a Cordo route handler as the default export:

```ts
// src/routes/command/ping.ts
import { defineCordoRoute } from 'cordo/core'
import { text } from 'cordo/components'

export default defineCordoRoute((i) => {
	i.render(
    text('Pong!')
  )
})
```

When a user executes the `/ping` slash command, Cordo routes the interaction directly to this file!
