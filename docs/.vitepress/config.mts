import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Cordo",
  description: "A framework for handling complex discord api interactions",
  
  // Base URL is typically the repository name if deploying to GitHub Pages,
  // but if the user has a custom domain or uses a user/organization site, 
  // it might just be '/'. For standard project pages, it should be '/cordo/'
  base: '/cordo/',

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Cookbook', link: '/cookbook/' }
    ],

    sidebar: [
      {
        text: 'Basics',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Component Concepts', link: '/guide/components' },
          { text: 'Interactions & State', link: '/guide/interactions-and-state' }
        ]
      },
      {
        text: 'Components',
        items: [
          { text: 'Buttons', link: '/components/buttons' },
          { text: 'Selects & Choices', link: '/components/selects' },
          { text: 'Inputs & Modals', link: '/components/inputs-modals' },
          { text: 'Typography & Media', link: '/components/typography-media' },
          { text: 'Structure & Layout', link: '/components/structure' }
        ]
      },
      {
        text: 'File Reference',
        items: [
          { text: 'Commands', link: '/reference/command' },
          { text: 'Route Handlers', link: '/reference/route' },
          { text: 'Error Boundaries', link: '/reference/error-boundary' },
          { text: 'Configuration', link: '/reference/cordo-config' },
          { text: 'Lockfile', link: '/reference/lockfile' },
          { text: 'Typegen', link: '/reference/typegen' }
        ]
      },
      {
        text: 'Routing',
        items: [
          { text: 'File Based Routing', link: '/guide/routing' }
        ]
      },
      {
        text: 'Cookbook',
        items: [
          { text: 'Reusable Components', link: '/cookbook/reusable-components' },
          { text: 'Advanced Patterns', link: '/cookbook/patterns' },
          { text: 'Localization', link: '/cookbook/localization' }
        ]
      },
      {
        text: 'Advanced',
        items: [
          { text: 'Lifecycle Hooks', link: '/guide/advanced/hooks' },
          { text: 'Extending Internals', link: '/guide/advanced/extend-internals' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/maanex/cordo' }
    ]
  }
})
