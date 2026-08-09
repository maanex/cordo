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
      { text: 'Guide', link: '/guide/getting-started' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/maanex/cordo' }
    ]
  }
})
