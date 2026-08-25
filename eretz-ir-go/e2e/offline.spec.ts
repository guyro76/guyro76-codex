import { test, expect } from '@playwright/test';

/**
 * "עובד בלי אינטרנט" — הבטחה שלא נבדקה מעולם.
 *
 * זה ההבדל המרכזי בין המשחק הזה לכל משחקי ארץ-עיר האחרים בחנות:
 * כולם דורשים חיבור. אצלנו זו הבטחה שכתובה בתיאור החנות ובמדיניות
 * הפרטיות — ועד עכשיו אף בדיקה לא הרימה את המכשיר, ניתקה אותו,
 * וניסתה לשחק.
 *
 * הבדיקה **לא** מנטרלת את ה-Service Worker, בניגוד לכל שאר
 * הבדיקות. הוא הנבדק כאן.
 *
 * מה שנבדק הוא המצב האמיתי: פותחים פעם אחת עם רשת (כמו התקנה
 * מהחנות), ואז הילד במטוס — בלי קליטה בכלל — מרענן ומשחק סיבוב שלם.
 */

/** מנתק את הרשת ברמת הדפדפן: גם `fetch`, גם ניווט, גם ה-SW */
async function goOffline(page: import('@playwright/test').Page): Promise<void> {
  await page.context().setOffline(true);
}

test('📴 אחרי ביקור אחד, המשחק נפתח ומשוחק במלואו בלי רשת', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  // --- ביקור ראשון, עם רשת. כאן ה-Service Worker מתקין את המטמון ---
  await page.goto('./');
  await expect(page.getByRole('button', { name: /בואו נשחק/ })).toBeVisible();

  const registered = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return false;
    const reg = await navigator.serviceWorker.ready;
    return Boolean(reg.active);
  });
  expect(registered, 'ה-Service Worker לא נרשם — אין מטמון ואין מצב לא מקוון').toBe(true);

  /**
   * ממתינים שהמטמון באמת יתמלא. `ready` מתקיים עם ההפעלה, אבל
   * ה-precache עצמו עדיין רץ — ובלי ההמתנה הזו הניתוק תופס חלקים
   * באמצע ההורדה, וזה מצב שלא קורה למשתמש אמיתי.
   */
  await expect
    .poll(
      async () =>
        page.evaluate(async () => {
          const names = await caches.keys();
          let total = 0;
          for (const name of names) {
            total += (await (await caches.open(name)).keys()).length;
          }
          return total;
        }),
      { timeout: 30_000, message: 'המטמון נשאר ריק' }
    )
    .toBeGreaterThan(10);

  // --- ומכאן: אין רשת בכלל ---
  await goOffline(page);
  /**
   * מוודאים שהניתוק באמת נכנס לתוקף. בלי זה הבדיקה עלולה לעבור
   * מפני שהרשת עדיין פתוחה — כלומר לא לבדוק כלום.
   */
  expect(await page.evaluate(() => navigator.onLine), 'הדפדפן לא באמת מנותק').toBe(false);
  await page.reload();

  // המשחק נפתח מהמטמון
  await expect(page.getByRole('button', { name: /בואו נשחק/ })).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();

  // --- סיבוב שלם, בלי רשת ---
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });
  await expect(page.locator('.cat-card').first()).toBeVisible();

  /**
   * ארצי נותן רמזים וחושף תשובה **מהמאגר המקומי**. זו הנקודה שבה
   * משחק שתלוי בשרת היה נעצר, ולכן זה מה שנבדק כאן ולא רק שהדף
   * נפתח.
   */
  const card = page.locator('.cat-card').first();
  await card.getByRole('button', { name: /רמז/ }).click();
  await expect(card.locator('.artzi-bubble')).toBeVisible();
  await card.getByRole('button', { name: /עוד רמז/ }).click();
  await card.getByRole('button', { name: /גלו לי/ }).click();
  const answer = await card.getByRole('textbox').inputValue();
  expect(answer.trim().length, 'ארצי לא הצליח לחשוף תשובה בלי רשת').toBeGreaterThan(1);

  // הבדיקה נסגרת גם היא מקומית, ומגיעה לניקוד
  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();
  await expect(page.getByRole('heading', { name: /תוצאות הסיבוב/ })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('✅').first()).toBeVisible();

  // --- והמילה נשמרה, גם בלי רשת ---
  const closeNew = page.getByRole('button', { name: /מעולה|למילה הבאה/ });
  while (await closeNew.first().isVisible().catch(() => false)) {
    await closeNew.first().click();
    await page.waitForTimeout(200);
  }
  await page.getByRole('button', { name: /לתוצאות המשחק/ }).click();
  await page.getByRole('button', { name: 'למסך הבית' }).click();
  await page.getByRole('button', { name: /אוסף המילים שלי/ }).click();
  await expect(page.locator('.word-card').first()).toBeVisible({ timeout: 20_000 });

  expect(errors, `שגיאות בזמן ניתוק: ${errors.join(' | ')}`).toEqual([]);

  await page.context().setOffline(false);
});
