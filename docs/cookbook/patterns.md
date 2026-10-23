# Advanced Patterns

These patterns describe architectural best practices for building robust and resilient Cordo applications.

## Admin & Permission Gates

You can use Route-level redirects to easily gate commands or settings panels behind permissions. By checking permissions immediately, you prevent unauthorized users from ever seeing the restricted UI.

```ts
// src/routes/admin/index.ts
import { defineCordoRoute } from 'cordo/core'
import { text } from 'cordo/components'

export default defineCordoRoute((i) => {
  // If the user isn't an admin, kick them out before rendering anything
  if (!userIsAdmin(i.user.id)) {
    return i.goto('error/unauthorized')
  }

  i.render(
    text('Welcome to the admin dashboard!')
  )
})
```

## The "Functional Mutation" Pattern

When a user submits data (e.g., toggling a setting via a button), you shouldn't mutate state directly in the UI rendering file. Instead, use a headless route via `run()`.

```ts
// src/routes/settings/toggle-notifications.ts
// HEADLESS ROUTE: No i.render() is called here.
import { defineCordoRoute } from 'cordo/core'

export default defineCordoRoute(async (i) => {
  const currentStatus = await db.getNotificationStatus(i.user.id)
  await db.setNotificationStatus(i.user.id, !currentStatus)
  
  // Pass a success message back to the UI
  i.locals.set('toast', 'Notifications updated!')
})
```

```ts
// src/routes/settings/index.ts
// UI ROUTE
import { defineCordoRoute } from 'cordo/core'
import { button, text } from 'cordo/components'
import { run, goto } from 'cordo/functions'

export default defineCordoRoute((i) => {
  i.render(
    text(i.locals.get('toast')).visible(i.locals.has('toast')),

    button()
      .label('Toggle Notifications')
      .onClick(
        // 1. Run the headless mutation
        run('settings/toggle-notifications', { wait: true }),
        // 2. Re-render this page so the user sees the updated state
        goto('.')
      )
  )
})
```

This pattern keeps your UI files clean and your mutation logic highly testable.

## The Global Error Boundary & Analytics

You can define a root `error.ts` in your `src/routes/` folder. This acts as the ultimate catch-all for any unhandled exceptions in your application. It's the perfect place to log metrics to an external provider (like PostHog, Sentry, or Datadog) before showing a generic apology to the user.

```ts
// src/routes/error.ts
import { defineCordoErrorBoundary } from 'cordo/core'
import { container, text } from 'cordo/components'
import { myAnalyticsTracker } from '../lib/analytics'

export default defineCordoErrorBoundary((error, req) => {
  // 1. Log the error to your analytics provider
  myAnalyticsTracker.captureException(error, {
    route: req.location,
    user: req.user?.id
  })
  
  // 2. Render a generic error state to the user
  req.render(
    container(
      text('Something went wrong!')
        .size('h2'),
      text('We have logged this issue and our team will look into it.')
    )
  )
})
```

## Dynamic Command Autocomplete

When creating slash commands that query databases, external APIs, or guild-specific data, pass an autocomplete handler to `choices` to provide instant, filtered suggestions as the user types.

```ts
// src/routes/command/profile.ts
import { defineCordoCommand, defineCordoRoute } from 'cordo/core'
import { text } from 'cordo/components'
import { searchGuildMembers } from '../../lib/guild'

const route = defineCordoRoute((i) => {
  const selectedMemberId = i.command.options.member
  i.render(text(`Displaying profile for <@${selectedMemberId}>`))
})

export default defineCordoCommand({
  type: 'chat',
  name: 'profile',
  description: 'View user profile in this guild',
  options: [
    {
      type: 'string',
      name: 'member',
      description: 'Search member by name',
      required: true,
      choices: async (query, i) => {
        // Query database or cache using the interaction context
        const members = await searchGuildMembers(i.guildId, query)

        return members.slice(0, 25).map(member => ({
          name: `${member.displayName} (@${member.username})`,
          value: member.id
        }))
      }
    }
  ],
  route
})
```

This pattern encapsulates your search and filtering logic directly within the command definition while retaining access to `i.guildId`, `i.locale`, and the calling `i.user`.
