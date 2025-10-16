import mkcert from 'vite-plugin-mkcert'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServer: {
    https: true
  },
  vite: {
    plugins: [
      mkcert()
    ]
  },
  app: {
    head: {
      link: [
        {
          rel: 'manifest',
          href: (process.env.NUXT_APP_BASE_URL !== undefined && process.env.NUXT_APP_BASE_URL != '/' ? (process.env.NUXT_APP_BASE_URL + '/') : '') + 'manifest.webmanifest',
        },
        { rel: 'icon', type: 'image/png', href: '/logo-pilahai-square-transparent-192.png' },
      ]
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css', '@mdi/font/css/materialdesignicons.css'],
  modules: ['@vite-pwa/nuxt', '@nuxtjs/tailwindcss'],
  pwa: {
    strategies: 'generateSW',
    registerType: 'autoUpdate',
    manifest: {
      id: '/',
      start_url: '/',
      name: 'Pilahai',
      short_name: 'Pilahai',
      description: 'Pilahai',
      theme_color: '#ffffff',
      icons: [
        {
          src: 'logo-pilahai-square-transparent-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'logo-pilahai-square-transparent-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      navigateFallback: null,
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },
})
