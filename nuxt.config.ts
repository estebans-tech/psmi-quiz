// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
export default defineNuxtConfig({
  routeRules: { '/scrum-guide': { prerender: true } },
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
  runtimeConfig: {
    // 🔒 private (inte exponerat till klienten)
    scrumGuide: {
      defaultSrc: process.env.NUXT_SCRUM_GUIDE_DEFAULT_SRC
        || 'https://scrumguides.org/scrum-guide.html',
      // CSV → lista av hostnamn
      allowedHostsCsv: process.env.NUXT_SCRUM_GUIDE_ALLOWED_HOSTS
        || 'scrumguides.org,www.scrumguides.org',
      // Cache TTL i sekunder
      cacheTtlSeconds: process.env.NUXT_SCRUM_GUIDE_CACHE_TTL_SECONDS
        || 86400
    },
    public: {
      // (valfritt) om du vill visa default-källan på klienten någonstans
      scrumGuideDefaultSrc: process.env.NUXT_PUBLIC_SCRUM_GUIDE_DEFAULT_SRC
        || 'https://scrumguides.org/scrum-guide.html'
    }
  },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
})