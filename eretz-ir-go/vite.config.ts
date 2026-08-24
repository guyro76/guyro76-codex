import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * BASE_PATH מאפשר פריסה גם לשורש דומיין (Vercel/Netlify) וגם לתת-נתיב
 * (GitHub Pages, למשל "/guyro76-codex/"). ה-manifest וה-Service Worker
 * נגזרים ממנו אוטומטית כדי שההתקנה כ-PWA תעבוד בשני המקרים.
 */
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      /**
       * עדכון אוטומטי, ולא בקשת אישור.
       *
       * הסיבה מדווחת מהשטח: אחרי תיקון באג המשתמש המשיך לראות את
       * הגרסה השבורה, כי ה-Service Worker הישן המשיך להגיש את
       * החבילה הישנה עד שמישהו ילחץ "עדכון" — ובאנר שאף אחד לא
       * שם לב אליו שקול לכך שהתיקון לא הגיע.
       *
       * skipWaiting + clientsClaim גורמים לגרסה החדשה להשתלט מיד,
       * כך שרענון אחד מספיק. במשחק לילדים אין מצב עריכה שאפשר
       * לאבד בהחלפה, ולכן אין כאן שום סיכון.
       */
      registerType: 'autoUpdate',
      includeAssets: ['icons/logo.svg'],
      manifest: {
        scope: base,
        name: 'ארץ-עיר GO!',
        short_name: 'ארץ-עיר GO!',
        description: 'משחק ארץ-עיר משפחתי חכם — עובד גם בלי אינטרנט ובלי איסוף מידע',
        dir: 'rtl',
        lang: 'he',
        display: 'standalone',
        orientation: 'any',
        start_url: base,
        background_color: '#1b1035',
        theme_color: '#2b1b5a',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // ניקוי חבילות ישנות, כדי שהמטמון לא יגדל בלי גבול.
        // skipWaiting/clientsClaim מוגדרים ממילא על ידי autoUpdate;
        // הוספה מפורשת שלהם גרמה ל-Service Worker להשתלט על הדף
        // באמצע חייו ולחתוך בקשות שכבר היו באוויר.
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
        navigateFallback: `${base}index.html`,
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
