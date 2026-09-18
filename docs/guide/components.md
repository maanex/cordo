# Components Concept

Cordo completely abstracts away Discord's raw component JSON payload. Instead of managing `custom_id`s, `action_rows`, array packing, and string constraints manually, Cordo provides a **declarative, composable Component API**.

Whenever you want to show UI to a user, you pass components into `i.render()`.

## Declarative UI

Cordo components are built using a fluent builder pattern. You initialize a component (like `button()`) and chain modifiers onto it to define its state.

```ts
import { button } from 'cordo/components'

// A button that is styled red, has a label, and triggers a route when clicked
button()
  .label('Dangerous Action')
  .style('danger')
  .onClick(goto('admin/delete'))
```

When you pass this into `i.render()`, Cordo automatically translates this chain into the exact JSON format that Discord's API requires.

## Auto-Layout

Discord has strict limits on how components can be arranged (e.g., maximum of 5 Action Rows, maximum of 5 buttons per row). Cordo abstracts this away. You simply pass a flat array of components into `i.render()`, and Cordo's auto-packer automatically bins them into valid Action Rows for you.

If you need explicit control over the layout, Cordo provides structural components like `container`, `row`, and `spacer` to force specific groupings or visual breaks.

## Conditional Rendering

A very common pattern in Cordo is conditionally hiding components without writing massive `if/else` trees. Every Cordo component has a `.visible(boolean)` modifier.

```ts
i.render(
  text('Welcome to the admin panel!')
    .visible(isAdmin),
    
  button()
    .label('Dangerous Action')
    .style('danger')
    .visible(isAdmin)
)
```

If `.visible(false)` is passed, Cordo skips rendering that component entirely.

## Modals & Prompts

While most components are rendered directly to the chat using `i.render()`, Cordo also supports popup Modals which are invoked using `i.prompt()`. 

When working with components that are designed to be placed inside a modal (like text inputs), you must use specific builder methods to define the labels and descriptions that Discord requires for modal fields. 

Rather than using `.label()`, which is typically reserved for standard chat UI components like buttons, modal-compatible components use:
- `.withLabel(text: string)`
- `.withDescription(text: string)`

```ts
import { modal, textInput } from 'cordo/components'

i.prompt(
  modal(
    textInput()
      .as('email')
      .withLabel('Your Email')
      .withDescription('We will not share this with anyone.')
  ).title('Contact Us')
)
```

> [!TIP]
> See the **Components** sidebar section for detailed reference pages on Buttons, Selects, Inputs, and Structural components!

## Advanced

In some very specific use cases, you might want to bypass Cordo's internal state management. Interactive components (like buttons, selects, and text inputs) provide an `.advanced` namespace with methods that let you take raw control over how they are generated.

### `overrideCustomId(customId: string)`
Normally, Cordo generates a `custom_id` dynamically to embed the `onClick`/`onSubmit` functs or `as()` referencing. If you use `overrideCustomId`, you can explicitly set the `custom_id` that is sent to Discord. 

> [!WARNING]
> Using `overrideCustomId` will break Cordo's standard event bindings. Any `.onClick()` or `.onSubmit()` handlers attached to the component will not execute, and `.as()` values will be ignored. Additionally interactions you receive in cordo with custom custom_id values will not be parsed properly by cordo and throw an error. Use with cation and only if you know what you are doing.
