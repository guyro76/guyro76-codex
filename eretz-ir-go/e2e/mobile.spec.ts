import { test, expect, devices, type Page } from '@playwright/test';
import { disableServiceWorker, stubExternalSources } from './helpers';

/**
 * QA לנייד — במגע אמיתי, לא בלחיצת עכבר.
 *
 * הבאג שדווח: באייפון (גם בכרום, שרץ על WebKit) לחיצה על "משחק יחיד"
 * ועל כפתורים אחרים לא הזיזה כלום. הסיבה: מסכי המשחק המתינו לכתיבה
 * ל-IndexedDB לפני הניווט, ובספארי בקשה כזו עלולה להישאר תלויה בלי
 * לסיים ובלי לשגות — ואז הלחיצה "לא עושה כלום" בשקט.
 *
 * הבדיקה השנייה כאן משתקת בכוונה את כתיבות ה-IndexedDB ומוודאת
 * שהמשחק עדיין מתקדם. זו הבדיקה שהייתה תופסת את התקלה.
 */

// לוקחים את מאפייני המכשיר בלבד ולא את `defaultBrowserType` של iPhone 13
// (הוא WebKit, שאינו מותקן כאן). המנוע נשאר Chromium, ולכן מה שנבדק הוא
// מסלול המגע וההיגיון של האפליקציה — לא הבדלי מנוע.
const iphone = devices['iPhone 13'];
test.use({
  viewport: iphone.viewport,
  userAgent: iphone.userAgent,
  deviceScaleFactor: iphone.deviceScaleFactor,
  isMobile: true,
  hasTouch: true
});

/** משתק כתיבות ל-IndexedDB: הבקשה נוצרת ולעולם לא מסתיימת */
async function hangIndexedDbWrites(page: Page) {
  await page.addInitScript(() => {
    const realPut = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (this: IDBObjectStore, ...args: unknown[]) {
      const request = (realPut as never as (...a: unknown[]) => IDBRequest).apply(this, args);
      // בולעים את האירועים — כך הבקשה נראית תקועה, בדיוק כמו באייפון
      Object.defineProperty(request, 'onsuccess', { set: () => undefined, get: () => null });
      Object.defineProperty(request, 'onerror', { set: () => undefined, get: () => null });
      request.addEventListener = () => undefined;
      return request;
    } as typeof IDBObjectStore.prototype.put;
  });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  /**
   * בלי זה ה-Service Worker מתחיל למלא את המטמון ברקע, ובקשות
   * ה-precache נקטעות כשהבדיקה נסגרת — `net::ERR_FAILED` שנספר
   * כשגיאת קונסול ומפיל את הבדיקה אחת לכמה הרצות. הבדיקות כאן
   * בודקות מגע וכפתורים, לא מטמון; יש בדיקה נפרדת שרצה עם ה-SW.
   */
  await disableServiceWorker(page);
  await stubExternalSources(page);
});

test('📱 מסלול מלא במגע: כל כפתור בדרך למשחק מגיב', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto('./');

  await page.getByRole('button', { name: /בואו נשחק/ }).tap();

  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();

  await page.getByRole('button', { name: /משחק חדש/ }).tap();
  await expect(page.getByRole('heading', { name: 'איך משחקים היום?' })).toBeVisible();

  // הכרטיס הזה הוא div עם role=button — בדיוק מה שדווח כלא מגיב
  // לחיצה על מצב מתקדמת ישירות למסך הקטגוריות
  await page.getByRole('button', { name: /משחק יחיד/ }).tap();
  await expect(page.getByRole('heading', { name: 'בחירת קטגוריות' })).toBeVisible();

  await page.getByRole('button', { name: /מהיר \(5\)/ }).tap();
  await page.getByRole('button', { name: /להגרלת האות/ }).tap();
  await expect(page.locator('.letter-wheel')).toBeVisible();

  await page.locator('.letter-wheel').tap();
  await page.getByRole('button', { name: /מתחילים/ }).tap({ timeout: 20_000 });
  await expect(page.locator('.cat-card').first()).toBeVisible();

  // גם המשחק עצמו: הקלדה, סיום, ותוצאות
  await page.locator('.cat-card').first().getByRole('textbox').fill('אבג');
  await page.getByRole('button', { name: /סיימתי/ }).tap();
  await expect(page.getByRole('heading', { name: /תוצאות הסיבוב/ })).toBeVisible({ timeout: 20_000 });

  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});

test('📱 גם כשכתיבת IndexedDB תקועה — המשחק מתחיל', async ({ page }) => {
  await hangIndexedDbWrites(page);
  await page.goto('./');

  await page.getByRole('button', { name: /בואו נשחק/ }).tap();
  await page.getByRole('button', { name: /משחק חדש/ }).tap();
  await expect(page.getByRole('heading', { name: 'איך משחקים היום?' })).toBeVisible();

  // זו הלחיצה שדווחה כתקועה. חייבת להתקדם מיד, בלי להמתין לדיסק.
  // לחיצה על מצב מתקדמת ישירות למסך הקטגוריות
  await page.getByRole('button', { name: /משחק יחיד/ }).tap();
  await expect(page.getByRole('heading', { name: 'בחירת קטגוריות' })).toBeVisible({ timeout: 5_000 });

  await page.getByRole('button', { name: /מהיר \(5\)/ }).tap();
  await page.getByRole('button', { name: /להגרלת האות/ }).tap();
  await expect(page.locator('.letter-wheel')).toBeVisible({ timeout: 5_000 });

  await page.locator('.letter-wheel').tap();
  await page.getByRole('button', { name: /מתחילים/ }).tap({ timeout: 20_000 });
  await expect(page.locator('.cat-card').first()).toBeVisible();
});

test('📱 מסכי התפריט נפתחים וחוזרים במגע', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).tap();

  for (const [label, heading] of [
    [/אוסף המילים שלי/, /אוסף המילים שלי/],
    [/הישגים/, /ההישגים שלי/],
    [/האתגר היומי/, /האתגר היומי/],
    [/לוח השיאים/, /לוח השיאים המשפחתי/],
    [/הגדרות/, /הגדרות/]
  ] as [RegExp, RegExp][]) {
    await page.getByRole('button', { name: label }).tap();
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    await page.getByRole('button', { name: /חזרה|←/ }).first().tap();
    await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();
  }

  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});

test('📱 כפתור ההמשך נשאר על המסך גם ברשימת מצבים ארוכה', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).tap();
  await page.getByRole('button', { name: /משחק חדש/ }).tap();

  // בלי לגלול בכלל — קלף המצב הראשון חייב להיות גלוי בתוך חלון התצוגה,
  // כי לחיצה עליו היא הפעולה שמתקדמת הלאה.
  const firstMode = page.getByRole('button', { name: /משחק יחיד/ }).first();
  await expect(firstMode).toBeInViewport();

  await firstMode.tap();
  await expect(page.getByRole('heading', { name: 'בחירת קטגוריות' })).toBeVisible();

  // גם במסך הקטגוריות, שהוא ארוך אף יותר
  const startCta = page.getByRole('button', { name: /להגרלת האות/ });
  await expect(startCta).toBeInViewport();
  await startCta.tap();
  await expect(page.locator('.letter-wheel')).toBeVisible();
});
