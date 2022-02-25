# Cordo

Cordo is a custom api wrapper built for interactions first. It functions as an addon on top of discord.js. Full documentation is yet to be written

Originally built for the FreeStuff Bot, this codebase could find various usecases so we decided to outsource it. Here's an [Example bot](https://github.com/Maanex/cordo-example-bot) written with it.

Or if you prefer real-life examples check out [FreeStuff Bot](https://github.com/FreeStuffBot/discord/tree/master/src/bot).

Use `npm i cordo` or `yarn add cordo` to install. Types are included.


## How it works (aka quick docs / tutorial)

### Commands

Go in bot/commands. They export a handler function as default which gets called when the command gets run.

### Components

Go in bot/components. They too export a handler function as default which gets called when the component gets interacted with (button press or dropdown selection).
You can create folders to build hierarchy. Each folder prefixes the resulting component id with the foldername and a _
For instance the handler in `components/foo/bar/test.ts` gets triggered for a component with the custom_id of `foo_bar_test`

### States

States are an extra layer to the Commands and Components that let you define command pages. Instead of editing or sending a response to a Command or Component Interaction, you can just ask it to take form of a state and Cordo will do the rest.

## Interaction flow

User presses button -> Check if this interaction has any overrides on timeout -> Check if there are global Component handlers -> Check if there is a state with the same name to take -> Error

User runs command -> Check if command handler exists -> Check if there is a state with the command name and _main -> Error


## API Coverage

✔️ Slash Commands

✔️ Command Groups

✔️ Command Autocomplete

✔️ Button Components

✔️ Dropdown Components

❌ Modals


## Naming Convensions

Commands may only have one word -> no CamelCase or snake_case needed

Components and States must be prefixed with the command they originated from -> A button on the settings command must start with settings_ (=> be placed inside a folder called settings)

Components must be named by their desired state and not how to get there. Example: Settings command has a page with general settings (settings_main), which has a button for advanced settings (settings_advanced) which has a button to destroy the world.
Incorrect naming: settings_advanced_destroy_world
Correct naming: settings_destroy_world

States also follow this principle to not inherit the path into the name, only the destination as shown above.

Components that just change state (like "open another page") or have state changing behaviour must be named like states. Example: config_page2, config_name
Components that have side effects (like changing settings or alike) must be named with a verb. Example: config_name_change, friends_request_send
For those verbs preferably pick:
* _change for Select/Dropdowns
* _toggle for Toggle Buttons
* _enable/_disable for Single Use Buttons

### Examples

Component and State names correct and incorrect examples:

❌ back

❌ back_button

❌ state_back

❌ settings_back

❌ settings_advanced_more

❌ command_free_button_one

✔️ settings_main

✔️ settings_description

✔️ free_show_details

✔️ settings_more

## Best practices

While theoretically the entire system could be built on soly using states, it is recomended to use interaction.reply and interaction.edit over states in non-interactive environments to save resources. States have a larger overhead than a simply interaction reply.

Cordo is best when it's used stateless. Try to reduce interactive responses to a minimum and always put as much information as possible in the custom ids. This allows for easy scaling as well as a great user experience. It might take some time to get used to but once you understand how to build on this, cordo naturally organizes your code.
