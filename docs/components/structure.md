# Structure & Layout

Cordo's structural components map directly to Discord's **Components V2** specification. Rather than just being logical wrappers, these compile down into native Discord JSON layout nodes (like Containers, Sections, and Action Rows).

## `container()`

Maps to Discord's **Container** (`Type 17`).

Containers are used to group components together visually or apply properties in bulk. In Discord V2, containers natively support styling.

```ts
import { container, text, button } from 'cordo/components'

container(
  text('Admin Danger Zone').size('h2'),
  button().label('Delete User').style('danger')
)
  .accentColor('#ff0000') // Native Discord container styling
  .spoiler() // Hides the entire container behind a spoiler blur
```

**Modifiers**:
- **Components**: Pass child components as arguments `container(...children)`.
- `.accentColor(color: string | number)`: Applies a colored accent bar to the container (e.g. `#ff0000`).
- `.spoiler(val?: boolean)`: Wraps the container in a spoiler warning.

## `section()`

Maps to Discord's **Section** (`Type 9`).

Forces all child components into a natively isolated layout section, ensuring they don't share Discord layout rows with components defined before or after the section.

```ts
import { section, button } from 'cordo/components'

section(
  button().label('I will definitely be isolated in my own section')
)
```

## `spacer()` & `divider()`

Map to Discord's **Separator** (`Type 14`).

Native components used to add physical layout space or a visual dividing line between components in the UI flow.

```ts
import { button, spacer, divider } from 'cordo/components'

i.render(
  button().label('Top Button'),
  spacer().size(2), // Adds empty vertical space
  divider(),        // Renders a visual dividing line
  button().label('Bottom Button')
)
```

**Modifiers**:
- `.size(size: number)`: Determines the thickness/amount of space added.

## `row()`

Maps to Discord's **ActionRow** (`Type 1`).

While Cordo's auto-packer handles Action Rows for you automatically by binning buttons and selects into rows of 5, you can use `row()` to force specific components into the *same* physical Action Row. 

If the components cannot fit into a single row (e.g., more than 5 buttons, or multiple select menus), Cordo will throw a layout error during compilation.

```ts
import { row, button } from 'cordo/components'

row(
  button().label('Left'),
  button().label('Right')
)
```
