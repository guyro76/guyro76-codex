import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

/** Chromium מותקן מראש בסביבת הפיתוח; ב-CI משתמשים בהתקנה הרגילה של Playwright */
const preinstalled = '/opt/pw-browsers/chromium';
const executablePath = process.env.PW_CHROMIUM ?? (existsSync(preinstalled) ? preinstalled : undefined);

/**
 * בדיקות E2E מריצות את האפליקציה הבנויה מול preview אמיתי,
 * כדי לאמת את המסלול המלא כמו שילד באמת משחק אותו.
 * Chromium מותקן מראש בסביבה — אין הורדות.
 */
/**
 * PW_BASE_URL מאפשר להריץ את אותן בדיקות מול תוצר פרוס אמיתי
 * (למשל התוכן שיושב בענף gh-pages) במקום מול preview מקומי.
 */
const externalBase = process.env.PW_BASE_URL;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [['list']],
  use: {
    baseURL: externalBase ?? 'http://127.0.0.1:4173/',
    locale: 'he-IL',
    // הרצה כ-root בקונטיינר דורשת את הדגל הזה, במיוחד בפרופילי נייד
    launchOptions: { executablePath, args: ['--no-sandbox', '--disable-dev-shm-usage'] },
    ...devices['Desktop Chrome']
  },
  webServer: externalBase
    ? undefined
    : {
        command: 'npm run preview -- --port 4173 --host 127.0.0.1',
        url: 'http://127.0.0.1:4173/',
        reuseExistingServer: true,
        timeout: 120_000
      }
});
