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
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    locale: 'he-IL',
    launchOptions: { executablePath },
    ...devices['Desktop Chrome']
  },
  webServer: {
    command: 'npm run preview -- --port 4173 --host 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 120_000
  }
});
