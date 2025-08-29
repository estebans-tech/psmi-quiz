// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
export default defineNuxtConfig({
  // SSR är default. Låt Nitro auto-detektera Netlify.
  ssr: true,
  compatibilityDate: '2024-05-07',
  // compatibilityDate: '2025-07-15',
  // nitro: {
  //   // Gör mappen tillgänglig som "server assets" i funktionerna
  //   // preset: 'netlify', // gör bundlingen 100% Netlify-kompatibel
  //   serverAssets: [
  //     { baseName: 'questions', dir: 'server/data' }
  //   ]
  // },
  // devtools: { enabled: true },
  // runtimeConfig: {
  //   public: {
  //     bmcSlug: process.env.NUXT_PUBLIC_BMC_SLUG
  //   }
  // },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt']
})