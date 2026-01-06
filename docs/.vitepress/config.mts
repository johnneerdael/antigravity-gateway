import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Antigravity Gateway",
  description: "Universal AI Gateway - Access Claude & Gemini models via OpenAI or Anthropic-compatible API",
  
  base: '/antigravity-gateway/',
  
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#7c3aed' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Antigravity Gateway' }],
    ['meta', { property: 'og:description', content: 'Universal AI Gateway for Claude & Gemini models' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Configuration', link: '/config/clients' },
      { text: 'Deployment', link: '/deployment/docker' },
      {
        text: 'v2.0.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Migration from v1', link: '/guide/migration' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Antigravity Gateway?', link: '/guide/what-is-antigravity-gateway' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Migration from v1', link: '/guide/migration' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Available Models', link: '/guide/models' },
            { text: 'Multi-Account Setup', link: '/guide/multi-account' },
            { text: 'API Endpoints', link: '/guide/api-endpoints' }
          ]
        }
      ],
      '/config/': [
        {
          text: 'Client Configuration',
          items: [
            { text: 'AI Coding Tools', link: '/config/clients' },
            { text: 'SDK Integration', link: '/config/sdk' },
            { text: 'LiteLLM', link: '/config/litellm' }
          ]
        }
      ],
      '/deployment/': [
        {
          text: 'Deployment',
          items: [
            { text: 'Docker', link: '/deployment/docker' },
            { text: 'Docker Compose', link: '/deployment/docker-compose' },
            { text: 'Caddy Reverse Proxy', link: '/deployment/caddy' },
            { text: 'Production Setup', link: '/deployment/production' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/johnneerdael/antigravity-gateway' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Antigravity Gateway Contributors'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/johnneerdael/antigravity-gateway/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
})
