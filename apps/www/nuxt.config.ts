import tailwindcss from '@tailwindcss/vite'
import { siteConfig } from './lib/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css', 'vue-sonner/style.css'],

  modules: ['@nuxtjs/color-mode', '@nuxt/fonts', '@nuxt/content', 'nuxt-shiki', 'nuxt-og-image', '@nuxt/image'],
  components: [
    { path: '~/components', ignore: ['examples/*', 'examples/**/*'] },
    { path: '~/components/demo', pathPrefix: false },
    { path: '~/components/content', global: true, pathPrefix: false },
  ],

  fonts: {
    defaults: {
      weights: [400, 500, 600, 700],
    },
  },

  content: {
    build: {
      markdown: {
        highlight: false,
      },
    },
    database: {
      type: 'd1',
      bindingName: 'DB',
    },
    // required to prevent error related to better-sqlite3 during build and deploy
    experimental: {
      sqliteConnector: 'native',
    },
  },

  build: {
    transpile: ['vee-validate', 'vue-sonner'],
  },

  vite: {
    plugins: [tailwindcss()],
  },

  shiki: {
    defaultTheme: {
      light: 'github-light-default',
      dark: 'github-dark',
    },
    bundledLangs: [
      'ts',
      'tsx',
      'js',
      'vue',
      'html',
      'json',
      'bash',
      'astro',
      'toml',
    ],
  },

  nitro: {
    preset: 'cloudflare-module',
    prerender: {
      crawlLinks: true,
      routes: ['/'],
      failOnError: false,
      autoSubfolderIndex: false,
    },
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
    serverAssets: [
      { baseName: 'blocks', dir: '../registry/new-york-v4/blocks' },
    ],
  },

  app: {
    head: {
      link: [
        { rel: 'manifest', href: `${siteConfig.url}/site.webmanifest` },
        { rel: 'shortcut icon', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      meta: [{ name: 'keywords', content: 'Nuxt,Vue,Tailwind CSS,Components,shadcn' }],
    },
  },
  ogImage: {
    fonts: [
      'Geist:400',
      'Geist:500',
      'Geist:600',
    ],
  },
})
