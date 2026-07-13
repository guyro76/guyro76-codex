import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/logo.svg'],
      manifest: {
        name: 'ארץ-עיר GO!',
        short_name: 'ארץ-עיר GO!',
        description: 'משחק ארץ-עיר משפחתי חכם — עובד גם בלי אינטרנט, בלי פרסומות ובלי איסוף מידע',
        dir: 'rtl',
        lang: 'he',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        background_color: '#1b1035',
        theme_color: '#2b1b5a',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // תמונות מ-Wikimedia Commons נשמרות במטמון לצפייה חוזרת במצב Offline
            urlPattern: /^https:\/\/upload\.wikimedia\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wikimedia-images',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/(he\.wikipedia\.org|www\.wikidata\.org)\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'wiki-api',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts']
  }
} as Parameters<typeof defineConfig>[0]);
