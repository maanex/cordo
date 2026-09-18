# Configuration (`cordo.config.ts`)

## What it is

The `cordo.config.ts` file is the central configuration hub for your Cordo application. It defines where your files are located, how Cordo should interact with Discord, and global behavioral overrides for routing and error handling.

## How it works

Cordo searches for this file at the root of your project when you call `await Cordo.mountCordo()`. It uses `defu` to recursively merge your configuration with Cordo's default values. 

If you don't define a value, Cordo will safely fall back to a sensible default.

> [!TIP]
> **Dynamic Overloading**
> You can pass an override configuration directly into the mount function to dynamically overload settings (such as injecting environment variables):
> ```ts
> await Cordo.mountCordo({
>   client: { id: process.env.DISCORD_CLIENT_ID }
> })
> ```

## What it can do

The configuration object has several distinct categories.

### `paths`
Defines the file structure of your app.
- `root`: The base directory Cordo searches within (defaults to `.`).
- `routes`: The folder where your route handlers live (defaults to `./routes`).
- `lockfile`: Where the `cordo.lock` file is generated (defaults to `./cordo.lock`).
- `types`: Where the generated TypeScript routes file is saved (e.g., `./src/types/cordo.ts`).

### `client`
Defines your Discord application credentials.
- `id`: Your Discord Application ID.
- `publicKey`: Your Discord Public Key (used for verifying incoming HTTP interactions).
- `token`: Your Discord Bot Token (used to authenticate API calls like syncing commands).

### `headless`
Mounting Cordo in headless mode (set to `true`) disables file system operations. It will not read the filesystem for configs, lockfiles, or routes, and will not write to the lockfile or generate types. This is useful if you only want to use Cordo for rendering component UI without full routing capabilities.

### `omitWarnings`
An array of specific warnings that Cordo should suppress. Use this carefully. Available flags:
- `'customIdOverride'`: Suppresses warnings when assigning an explicit `custom_id` alongside existing action handlers (which causes them not to fire).
- `'headlessCustomIdGeneration'`: Suppresses warnings about generating unusable custom IDs in headless mode.
- `'placeholderTextAppearance'`: Suppresses warnings when Cordo auto-fills required text fields (like empty labels).

### `upstream`
Defines connection settings to Discord's API.
- `baseUrl`: Defaults to `https://discord.com/api/v10`.
- `autoDeferMs`: If a route doesn't respond within this timeframe (in milliseconds), Cordo will automatically send a deferral request to Discord to prevent the interaction from timing out. Set to `0` to disable.

### `functDefaultFlags`
Sets global default behaviors for Cordo Functs (`run` and `goto`).
- **`run`**:
  - `wait`: Should the execution wait for the run to finish?
  - `continueOnError`: If the run throws an error, should execution proceed?
  - `privateErrorMessage`: If the run throws an error, should the resulting error message be ephemeral (private)?
- **`goto`**:
  - `asReply`: Should the goto render as a reply instead of updating the current message?
  - `private`: Should the response be ephemeral?
  - `disableComponents`: Should the old components be disabled while the new route loads?

### `hooks`
A powerful set of lifecycle interceptors. You can return `null` from any hook to stop the flow of data at that point.
- `onRawInteraction`: Called the moment an interaction is received, before Cordo parses it.
- `onBeforeHandle`: Called after parsing, right before routing begins.
- `onBeforeRespond`: Called right before a JSON payload is returned or sent to Discord.
- `onAfterRespond`: Called with the `AxiosResponse` of outgoing API calls.
- `onNetworkError`: Called when outgoing API calls fail.
- `transformCommandName`: Intercepts the raw command name (from Discord) and transforms it into a route string.
- `transformUserFacingText`: Intercepts all text rendered in UI components for centralized localization/translation.
- `captureUnroutableErrors`: Captures errors that occurred outside of a valid routing context (e.g., in a `run` funct with a broken path).
- `captureUnhandledErrors`: Captures errors that bubbled up past the root `routes` folder without hitting an `error.ts` boundary.
