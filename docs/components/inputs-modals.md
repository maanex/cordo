# Inputs & Modals

If you need a user to type out text input or upload a file via a form, you use Modals. Unlike standard components rendered via `i.render()`, modals are invoked using `i.prompt()`.

## `modal()`

Cordo maps this to an internal pseudo-component which unwraps directly into a Discord Interaction Response payload of type `Modal`.

The root component for a popup form. A modal can contain up to 5 input components.

```ts
import { modal, textInput } from 'cordo/components'
import { run } from 'cordo/functions'

export default defineCordoRoute((i) => {
  i.prompt(
    modal(
      // Inputs go here as arguments
      textInput().as('feedback').withLabel('Your thoughts')
    )
    .title('Feedback Form')
    .onSubmit(run('actions/submit-feedback', { wait: true }))
  )
})
```

**Modifiers**:
- **Components**: The inputs are passed as arguments: `modal(...inputs)`.
- `.title(text: string)`: The title of the modal popup.
- `.onSubmit(funct: CordoFunct)`: The action to run when the user submits the form.

## `textInput()`

Maps to Discord's **TextInput** (`Type 4`).

A text field for the user to type into. It can only be used inside a `modal()`.

```ts
import { textInput } from 'cordo/components'

textInput()
  .as('feedback') // 'feedback' is the ID you'll use to read the value later
  .withLabel('What do you think?')
  .placeholder('Type your feedback here...')
  .size('multi') // Makes it a large multi-line text box
  .required(true)
```

**Modifiers**:
- `.as(id: string)`: Assigns a data ID to the input. This is the key you will use to retrieve the data in the route that handles the form submission.
- `.placeholder(text: string)`: Ghost text inside the box.
- `.withLabel(text: string)`: The title above the text box.
- `.withDescription(text: string)`: Instructional text below the label.
- `.size(size: 'single' | 'multi')`: Whether the input is a single line (1) or multi-line (2).
- `.required(required?: boolean)`: Forces the user to fill it out.
- `.current(text: string)`: Pre-fills the input with a default value.
- `.min(num: number)` / `.max(num: number)`: Enforces length constraints (0-4000).

## `fileUpload()`

Maps to Discord's **FileUpload** (`Type 19`).

Allows the user to upload a file (like an image or document). 

```ts
import { fileUpload } from 'cordo/components'

i.render(
  fileUpload()
    .as('attachment_1')
    .withLabel('Upload your receipt')
)
```

**Modifiers**:
- `.as(id: string)`: Assigns a data ID to the input.
- `.withLabel(text: string)`: Sets the label (when used inside a Modal).
- `.withDescription(text: string)`: Sets the description (when used inside a Modal).
- `.min(num: number)`: Minimum number of files.
- `.max(num: number)`: Maximum number of files.
- `.onSubmit(funct: CordoFunct)`: The action to run when the user confirms their upload.
