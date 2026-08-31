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
  /**
   * שני שרתי תצוגה מקדימה, ושניהם מגישים **את מה שכבר בנוי בדיסק**.
   *
   * שימו לב: `reuseExistingServer` חוסך זמן, אבל הוא גם אומר
   * ש-`npx playwright test` לבדו אינו בונה כלום — ואם הבנייה
   * ישנה, הבדיקות ירוצו מול גרסה קודמת ויעברו בשקט. זה קרה בפועל.
   * לכן `npm run test:e2e` בונה את שתי הבניות לפני ההרצה, וזו
   * הפקודה שצריך להריץ.
   */
  webServer: externalBase
    ? undefined
    : [
        {
          command: 'npm run preview -- --port 4173 --host 127.0.0.1',
          url: 'http://127.0.0.1:4173/',
          reuseExistingServer: true,
          timeout: 120_000
        },
        /**
         * בנייה שנייה, על פורט 4174, שבה משתני הסביבה של החשבונות
         * מוגדרים — ולכן היא הבנייה היחידה שבה הגרסה החינמית באמת
         * נאכפת (ראו `capabilitiesFor`). בלעדיה אי אפשר לבדוק את
         * הפרסומות ואת הנעילות בזרימה אמיתית אלא רק בקריאת קוד.
         */
        {
          command: 'npm run build:free && npm run preview:free -- --port 4174 --host 127.0.0.1',
          url: 'http://127.0.0.1:4174/',
          /**
           * **בלי שימוש חוזר** בשרת של בניית החשבונות.
           *
           * הבנייה הזו נוצרת בפקודה של השרת עצמו, ולכן שרת שנשאר
           * מהרצה קודמת מגיש `dist-free` **ישן** — והבדיקות נופלות
           * על אלמנטים שלא קיימים בו, או גרוע מזה עוברות מול קוד
           * שכבר לא קיים. זה קרה בפועל שלוש פעמים בפרויקט הזה.
           * בנייה מחדש עולה שניות; ריצה ירוקה מול בנייה ישנה
           * עולה הרבה יותר.
           */
          reuseExistingServer: false,
          timeout: 180_000
        }
      ]
});

/** הכתובת של בניית הגרסה החינמית, לשימוש הבדיקות שנוגעות בה */
export const FREE_BASE_URL = 'http://127.0.0.1:4174/';
