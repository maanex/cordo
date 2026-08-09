# Selects & Choices

Select menus allow users to choose one or more options from a dropdown list. 

## `selectString()`

Maps to Discord's **StringSelect** (`Type 3`).

A standard dropdown menu that allows the user to pick from a list of predefined string choices.

```ts
import { selectString } from 'cordo/components'
import { goto } from 'cordo/functions'

i.render(
  selectString()
    .placeholder('Choose a setting...')
    .addOption({
      label: 'Notifications',
      description: 'Manage your notification settings',
      emoji: '🔔',
      onClick: [goto('settings/notifications')]
    })
    .addOption({
      label: 'Appearance',
      onClick: [goto('settings/appearance')]
    })
)
```

**Modifiers**:
- `.as(id: string)`: Assigns a data ID to the select menu, useful when rendering it inside a Modal.
- `.placeholder(text: string)`: The text shown when no option is selected.
- `.min(num: number)`: Minimum number of items that must be selected (default: 1).
- `.max(num: number)`: Maximum number of items that can be selected (default: 25).
- `.addOption(option)`: Adds an option to the dropdown. The option object takes a `label`, `description`, `emoji`, `value`, and an `onClick` Funct array.
- `.setOptions(options: array)`: Overwrites all current options with the provided array.
- `.disabled(disabled?: boolean)`: Disables the entire select menu.
- `.onSubmit(funct: CordoFunct)`: The action to run when the user confirms their selection.
- `.withLabel(text: string)`: Sets the label (when used inside a Modal).
- `.withDescription(text: string)`: Sets the description (when used inside a Modal).

## `checkboxGroup()`

Maps to Discord's **CheckboxGroup** (`Type 22`).

Renders a list of options where the user can select multiple items (a multi-select UI). 

```ts
import { checkboxGroup } from 'cordo/components'
import { run } from 'cordo/functions'

i.render(
  checkboxGroup()
    .max(3) // Limits the user to selecting at most 3 items
    .addOption({
      label: 'Announcements',
      value: 'role_1' // Data value passed to your backend
    })
    .addOption({
      label: 'Giveaways',
      value: 'role_2'
    })
    .onSubmit(run('actions/apply-roles'))
)
```

**Modifiers**:
- `.as(id: string)`: Assigns a data ID to the group.
- `.min(num: number)`: Minimum number of items that must be selected.
- `.max(num: number)`: Maximum number of items that can be selected.
- `.addOption(option)`: Adds an option. Note that checkboxes use `value` and `onSubmit`, rather than individual `onClick` handlers per option.
- `.onSubmit(funct: CordoFunct)`: The action to run when the user confirms their selection.
- `.withLabel(text: string)`: Sets the label (when used inside a Modal).
- `.withDescription(text: string)`: Sets the description (when used inside a Modal).

## `radioGroup()`

Maps to Discord's **RadioGroup** (`Type 21`).

Similar to `checkboxGroup`, but enforces that the user can only select exactly *one* item from the list.

```ts
import { radioGroup } from 'cordo/components'
import { run } from 'cordo/functions'

i.render(
  radioGroup()
    .addOption({ label: 'Red', value: 'red' })
    .addOption({ label: 'Blue', value: 'blue' })
    .addOption({ label: 'Green', value: 'green' })
    .onSubmit(run('actions/save-color'))
)
```

**Modifiers**:
- `.as(id: string)`: Assigns a data ID to the group.
- `.addOption(option)`: Adds an option.
- `.onSubmit(funct: CordoFunct)`: The action to run when the user confirms their selection.
- `.withLabel(text: string)`: Sets the label (when used inside a Modal).
- `.withDescription(text: string)`: Sets the description (when used inside a Modal).
