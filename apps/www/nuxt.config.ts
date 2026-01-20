import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

const blocksDir = fileURLToPath(new URL('../../packages/blocks/src', import.meta.url))
const blocksAssetsDir = fileURLToPath(new URL('../registry/server/assets/registry', import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  css: [
    '~/assets/css/main.css',
    'vue-sonner/style.css',
  ],

  modules: [
    '@nuxtjs/color-mode',
    '@nuxt/fonts',
    '@nuxt/content',
    'nuxt-shiki',
    'nuxt-og-image',
    '@nuxt/image',
    '@tresjs/nuxt',
  ],

  components: [
    { path: '~/components' },
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
    transpile: ['vue-sonner'],
  },

  vite: {
    resolve: {
      alias: {
        '@blocks': blocksDir,
      },
    },
    plugins: [
      tailwindcss(),
    ],
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
      wrangler: {
        name: 'elevenlabs-ui-vue',
        d1_databases: [
          {
            binding: 'DB',
            database_id: 'ec926b1b-6d1b-46e2-931d-2a123ac578ea',
          },
        ],
        observability: {
          logs: {
            enabled: true,
            head_sampling_rate: 1,
            invocation_logs: true,
          },
        },
      },
    },

    serverAssets: [
      { baseName: 'blocks', dir: blocksAssetsDir },
    ],
  },

  ogImage: {
    fonts: [
      'Geist:400',
      'Geist:500',
      'Geist:600',
    ],
  },

  runtimeConfig: {
    elevenlabsApiKey: process.env.ELEVENLABS_API_KEY,
  },
})
