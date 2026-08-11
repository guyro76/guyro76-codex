import { test, expect, type Page } from '@playwright/test';
import { stubWikipedia } from './helpers';

/**
 * התוספות: קרדיט קבוע, משימת ביניים בין סיבובים, קניית תשובה מהקרדיט,
 * ומעבר בין משחק על זמן למשחק בלי ספירת זמן.
 */

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await stubWikipedia(page);
});

/** פתיחה → פרופיל → משחק יחיד עם מספר סיבובים נתון */
async function startGame(page: Page, rounds: string) {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('heading', { name: 'אורי' }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.locator('select').first().selectOption(rounds);
}

async function intoRound(page: Page) {
  await page.getByRole('button', { name: /המשך לבחירת קטגוריות/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });
}

test('©️ הקרדיט מופיע בתחתית כל מסך', async ({ page }) => {
  await page.goto('./');
  const credit = page.getByText(/תוכנן ונבנה על ידי גיא רוזנברג 2026/);
  await expect(credit).toBeVisible();

  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await expect(credit).toBeVisible();
  await page.getByRole('heading', { name: 'אורי' }).click();
  await expect(credit).toBeVisible();
  await page.getByRole('button', { name: /הגדרות/ }).click();
  await expect(credit).toBeVisible();

  // סגול חציל ומודגש, כפי שהוגדר
  const weight = await credit.evaluate((el) => getComputedStyle(el).fontWeight);
  expect(Number(weight)).toBeGreaterThanOrEqual(700);
  const color = await credit.evaluate((el) => getComputedStyle(el).color);
  expect(color).toBe('rgb(192, 123, 216)');
});

test('⏱️ אפשר לשחק על זמן וגם בלי ספירת זמן, ולהחליף באמצע הסיבוב', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(String(err)));

  await startGame(page, '1');

  // בוחרים "בלי ספירת זמן" עוד לפני שהמשחק התחיל
  await page.getByRole('button', { name: /בלי ספירת זמן/ }).click();
  await intoRound(page);
  const toggle = page.getByRole('button', { name: 'החלפת מצב זמן' });
  await expect(page.getByText('♾️ בלי לחץ')).toBeVisible();
  await expect(page.getByRole('timer')).toBeHidden();

  // ומחליפים לשעון באמצע הסיבוב — בלי לצאת מהמשחק
  await toggle.click();
  await expect(page.getByRole('timer')).toBeVisible();

  // וחזרה שוב, כדי לוודא שזה עובד לשני הכיוונים
  await toggle.click();
  await expect(page.getByText('♾️ בלי לחץ')).toBeVisible();

  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});

test('🎲 בין סיבוב לסיבוב מגיעה משימה — אפשר לשחק אותה או לדלג', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(String(err)));

  await startGame(page, '2');
  await intoRound(page);
  await page.getByRole('button', { name: /סיימתי/ }).click();
  await expect(page.getByRole('heading', { name: /תוצאות הסיבוב/ })).toBeVisible({ timeout: 20_000 });

  const closeNew = page.getByRole('button', { name: /מעולה|למילה הבאה/ });
  while (await closeNew.first().isVisible().catch(() => false)) {
    await closeNew.first().click();
    await page.waitForTimeout(200);
  }

  await page.getByRole('button', { name: /למשימת הביניים/ }).click();
  await expect(page.getByRole('heading', { name: 'משימת ביניים!' })).toBeVisible();

  // מסלול הדילוג מוביל ישר להגרלת האות הבאה
  await page.getByRole('button', { name: /לדלג לאות הבאה/ }).click();
  await expect(page.locator('.letter-wheel')).toBeVisible();

  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});

test('🛒 קניית תשובה: חסומה בלי קרדיט, ועובדת אחרי שצוברים', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(String(err)));

  await startGame(page, '2');
  await intoRound(page);

  // בתחילת המשחק הארנק ריק — שני אמצעי התשלום מושבתים ואין קנייה
  await page.locator('.cat-card').first().getByRole('button', { name: /קניית תשובה/ }).click();
  await expect(page.getByRole('heading', { name: /קניית תשובה/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /שטרות/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /יהלומים/ })).toBeDisabled();
  await page.getByRole('button', { name: 'לא עכשיו' }).click();

  // מזרימים קרדיט ישירות לארנק. צבירה אמיתית דורשת כמה סיבובים מלאים
  // (הרמזים מוגבלים לסיבוב), והחישוב עצמו מכוסה ב-tests/wallet.test.ts —
  // כאן בודקים את פעולת הקנייה עצמה.
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open('eretz-ir-go');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const tx = db.transaction('settings', 'readwrite');
          tx.objectStore('settings').put({ key: 'wallet-1', value: JSON.stringify({ bills: 9, gems: 4 }) });
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      })
  );

  // עכשיו יש קרדיט — הקנייה ממלאת את התשובה בפועל ומורידה מהארנק
  const target = page.locator('.cat-card').last();
  await expect(target.getByRole('textbox')).toHaveValue('');
  await target.getByRole('button', { name: /קניית תשובה/ }).click();
  await expect(page.getByRole('button', { name: /שטרות/ })).toBeEnabled();
  await page.getByRole('button', { name: /שטרות/ }).click();
  await expect(target.getByRole('textbox')).not.toHaveValue('', { timeout: 10_000 });
  await expect(page.getByLabel(/בארנק 6 שטרות/)).toBeVisible();

  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});
test('🎲 אפשר לכבות את משימות הביניים בהגדרות', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('heading', { name: 'אורי' }).click();
  await page.getByRole('button', { name: /הגדרות/ }).click();
  await page.getByLabel(/משימות ביניים/).uncheck();
  await page.getByRole('button', { name: /חזרה|←/ }).first().click();

  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.locator('select').first().selectOption('2');
  await intoRound(page);
  await page.getByRole('button', { name: /סיימתי/ }).click();
  await expect(page.getByRole('heading', { name: /תוצאות הסיבוב/ })).toBeVisible({ timeout: 20_000 });

  const closeNew = page.getByRole('button', { name: /מעולה|למילה הבאה/ });
  while (await closeNew.first().isVisible().catch(() => false)) {
    await closeNew.first().click();
    await page.waitForTimeout(200);
  }

  // בלי משימות ביניים עוברים ישר להגרלת האות הבאה
  await page.getByRole('button', { name: /לסיבוב הבא/ }).click();
  await expect(page.locator('.letter-wheel')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'משימת ביניים!' })).toBeHidden();

  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});

test('🔄 החלפת אות: הראשונה חינם, השנייה דורשת קרדיט או חידה', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(String(err)));

  await startGame(page, '2');
  await page.getByRole('button', { name: /המשך לבחירת קטגוריות/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await expect(page.getByRole('button', { name: /מתחילים/ })).toBeVisible({ timeout: 20_000 });

  // ההחלפה הראשונה חינם — לחיצה אחת, בלי חלונית ובלי תשלום
  const free = page.getByRole('button', { name: /החלפת אות — חינם/ });
  await expect(free).toBeVisible();
  await free.click();

  // הגלגל מסתובב מחדש ונוחת על אות
  await expect(page.getByRole('button', { name: /מתחילים/ })).toBeVisible({ timeout: 20_000 });

  // עכשיו ההחלפה כבר לא חינם
  await expect(free).toBeHidden();
  const paid = page.getByRole('button', { name: /החלפת אות נוספת/ });
  await expect(paid).toBeVisible();
  await paid.click();

  // בלי קרדיט שני אמצעי התשלום מושבתים — אבל מסלול החידה תמיד פתוח
  await expect(page.getByRole('button', { name: /שטרות/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /יהלום/ })).toBeDisabled();
  await page.getByRole('button', { name: /לפתור חידה/ }).click();

  const answer = page.getByRole('textbox', { name: 'התשובה לחידה' });
  await expect(answer).toBeVisible();
  await answer.fill('תשובה שגויה לגמרי');
  await page.getByRole('button', { name: 'זו התשובה!' }).click();
  await expect(page.getByText(/לא בדיוק/)).toBeVisible();

  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});
