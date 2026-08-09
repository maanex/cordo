# Typography & Media

Cordo fully supports Discord's V2 component structure, meaning text and media are treated as first-class native UI components, rather than just simple message content.

## `text()`

Maps to Discord's **TextDisplay** (`Type 10`) component. 

The `text()` component renders markdown text into the interaction payload. Cordo automatically concatenates adjacent text components together, respecting newlines and formatting, to optimize the payload size.

```ts
import { text } from 'cordo/components'

i.render(
  text('Welcome to the server!').size('h1'),
  
  // You can pass multiple arguments which will be joined by spaces
  text('Please read the rules below:', 'Thank you!')
)
```

**Modifiers**:
- **Content Arguments**: `text(...content)` takes any number of string arguments, which are joined by spaces.
- `.size(size: 'h1' | 'h2' | 'h3' | 'small' | 'default')`: Wraps the text in Discord's native formatting (e.g., `#`, `##`, `###`, `-#`).
- `.bold(val?: boolean)`: Wraps the text in `**`.
- `.italic(val?: boolean)`: Wraps the text in `*`.
- `.underline(val?: boolean)`: Wraps the text in `__`.
- `.strike(val?: boolean)`: Wraps the text in `~~`.
- `.quote(val?: boolean)`: Prefixes the line with `> `.
- `.code(val?: boolean)`: Wraps the text in inline code backticks `` ` ``.
- `.codeBlock(language?: string, val?: boolean)`: Wraps the text in a markdown codeblock.
- `.link(url: string)`: Formats the text as a clickable markdown hyperlink `[text](url)`.

## `image()`

Maps to Discord's **Thumbnail** (`Type 11`) component.

Renders a remote image url natively inside the UI component tree.

```ts
import { image } from 'cordo/components'

i.render(
  image('https://example.com/banner.png')
    .description('A welcome banner')
    .spoiler()
)
```

**Modifiers**:
- **URL**: Passed as the first argument: `image(url)`.
- `.description(text: string)`: Adds alt-text or a description to the image.
- `.spoiler(val?: boolean)`: Blurs the image behind a spoiler warning.

*(Note: If an `image()` is placed inside a `gallery()`, it automatically adapts to act as a `MediaGallery` item instead of a standalone thumbnail.)*

## `gallery()`

Maps to Discord's **MediaGallery** (`Type 12`).

A native Discord layout component specifically designed to display a grid of images. **It only accepts `image()` (`Thumbnail`) components as children.**

```ts
import { gallery, image } from 'cordo/components'

// Renders a native Discord media grid
gallery(
  image('https://example.com/art1.png'),
  image('https://example.com/art2.png')
)
```
