import tailwindcss from '@tailwindcss/vite';

// The public address of the site. Used for the canonical link and social previews.
// Change it once the domain is chosen.
const siteUrl = 'https://andrej-dev.com';

export default defineNuxtConfig({
  compatibilityDate: '2026-10-07',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/fonts'],
  components: [{ path: '~/components', pathPrefix: false }],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  nitro: {
    preset: 'static',
  },
  runtimeConfig: {
    public: { siteUrl },
  },
  fonts: {
    families: [
      { name: 'Geist', weights: [300, 400, 500] },
      { name: 'Geist Mono', weights: [400] },
    ],
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
});
