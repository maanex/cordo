# Lockfile (`cordo.lock`)

## What it is

The `cordo.lock` file is an auto-generated state file that manages route minification and string compression. You should never edit this file manually, but you should commit it to version control.

## How it works

Discord enforces a strict limit of 100 characters on the `custom_id` field of any interactive component (like a button or select menu). Since Cordo encodes the entire route path, parameters, and attached funct flags into this single string, 100 characters is often not enough for deep application states.

To solve this, Cordo minifies your routing tree. When `Cordo.mountCordo()` runs, it scans your `routes` directory and assigns a unique 3-character ID (like `a00`, `b00`) to every route file. This mapping is saved in the lockfile. 

When Cordo renders a button that triggers a route, it sends the 3-character ID to Discord instead of the full path. When Discord sends the interaction back, Cordo uses the lockfile to decompress the ID back into the full route path.

## What it can do

The lockfile stores two primary sections:

### 1. `[routes]`
A mapping of 3-character IDs to your route strings.
```ini
[routes]
000 command/help.ts
100 settings/notifications/index.ts
```

### 2. `[lut]` (Look Up Table)
Cordo allows you to register common string constants (like 'steam', 'playstation', or common database flags). If a string parameter matches an entry in the LUT, Cordo compresses it down to a 3-character ID as well, saving even more space in the `custom_id` limit.

You can register these constants in your codebase:
```ts
Cordo.registerConstants(['steam', 'epic', 'xbox', 'playstation'])
```

The resulting lockfile will store them in the LUT section:
```ini
[lut]
000 steam
100 epic
200 xbox
300 playstation
```
