# Error Boundaries

## What it is

An Error Boundary is a special file named `error.ts` that catches any unhandled exceptions thrown by Route Handlers within its directory or any subdirectories. It prevents your bot from crashing or hanging silently when things go wrong.

## How it works

When an error is thrown in a route, Cordo traverses the directory tree upwards to find the nearest `error.ts` file. 

1. It starts searching in the folder of the route that threw the error.
2. If none is found, it moves up one folder.
3. This repeats until it leaves the `routes` directory, at which point it uses Cordo's built-in fallback error handler.

> [!NOTE]
> The search starts at the *current working directory* of the executed file. If you use `goto`, the cwd changes to the new route. If you use `run`, the cwd stays the same.

## What it can do

An Error Boundary must `export default defineCordoErrorBoundary()`. It receives the error object and a `req` object (which acts identically to the `i` interaction object).

Inside an error boundary, you can:
- **Render a fallback UI**: Send a friendly error message to the user using `req.render()`.
- **Log analytics**: Send the error stack trace to an external monitoring tool (like Sentry or PostHog).
- **Rethrow the error**: If the boundary cannot handle a specific error, it can `throw` it again, passing the responsibility to the next `error.ts` higher up in the tree.

```ts
// src/routes/settings/error.ts
import { defineCordoErrorBoundary } from 'cordo/core'
import { text } from 'cordo/components'

export default defineCordoErrorBoundary((error, req) => {
  // If it's a specific database error, handle it here
  if (error.name === 'DatabaseTimeout') {
    return req.render(
      text('The database took too long to respond. Please try again in a moment.')
    )
  }
  
  // Otherwise, bubble it up to the root error boundary
  throw error
})
```
