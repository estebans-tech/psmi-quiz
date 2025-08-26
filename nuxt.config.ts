// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
export default defineNuxtConfig({
  // SSR är default. Låt Nitro auto-detektera Netlify.
  ssr: true,
  compatibilityDate: '2025-07-15',
  nitro: {
    // Gör mappen tillgänglig som "server assets" i funktionerna
    preset: 'netlify', // gör bundlingen 100% Netlify-kompatibel
    serverAssets: [
      { baseName: 'data', dir: 'server/data' }
    ]
  },
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt']
})