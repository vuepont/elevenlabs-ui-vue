// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/css/tailwind.css'],

  // Transpile workspace packages that contain Vue SFCs
  build: {
    // transpile: ['@repo/elements', '@repo/examples', '@repo/shadcn-vue'],
  },

  vite: {
    plugins: [tailwindcss()],
  },
})
