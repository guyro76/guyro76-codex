import { test, expect } from '@playwright/test';
import { disableServiceWorker, stubExternalSources } from './helpers';

/**
 * "שוב, כמו קודם" — הקיצור מהמסך הראשי ישר לתוך משחק.
 *
 * הדרך למשחק עברה חמש הקשות. בפעם הראשונה כל מסך שם עושה עבודה
 * אמיתית; בפעם החמישים כולם מכשול. הבדיקה מוודאת שלושה דברים
 * שקל לשבור: שהקיצור **לא** מוצג לשחקן חדש, שהוא מופיע אחרי משחק
 * אחד, ושהוא באמת ממשיך את ההגדרות הקודמות ולא מתחיל משחק אחר.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await disableServiceWorker(page);
  await stubExternalSources(page);
});

const QUICK = /שוב, כמו קודם/;

test('▶️ הקיצור מופיע רק אחרי משחק אחד, וממשיך את ההגדרות הקודמות', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();

  // --- שחקן חדש: אין "כמו קודם", כי לא היה קודם ---
  await expect(page.getByRole('button', { name: QUICK })).toHaveCount(0);

  // --- משחק ראשון, במסלול המלא, עם הגדרות שנזכור ---
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await expect(page.getByText(/נבחרו 5 מתוך/)).toBeVisible();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });
  await expect(page.locator('.cat-card')).toHaveCount(5);

  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();
  await expect(page.getByRole('heading', { name: /תוצאות הסיבוב/ })).toBeVisible({ timeout: 25_000 });
  const closeNew = page.getByRole('button', { name: /מעולה|למילה הבאה/ });
  while (await closeNew.first().isVisible().catch(() => false)) {
    await closeNew.first().click();
    await page.waitForTimeout(200);
  }
  await page.getByRole('button', { name: /לתוצאות המשחק/ }).click();
  await page.getByRole('button', { name: 'למסך הבית' }).click();

  // --- ועכשיו הקיצור קיים ---
  const quick = page.getByRole('button', { name: QUICK });
  await expect(quick).toBeVisible();

  /**
   * הלחיצה מדלגת על בחירת מצב ועל הקטגוריות ונוחתת ישר בגלגל
   * האותיות. זה כל הרעיון — ואם מישהו יחזיר מסך באמצע, הבדיקה
   * תיפול.
   */
  await quick.click();
  await expect(page.locator('.letter-wheel')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('heading', { name: 'איך משחקים היום?' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'בחירת קטגוריות' })).toHaveCount(0);

  // --- ואותן חמש קטגוריות בדיוק, ולא ברירת המחדל של תשע ---
  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });
  await expect(page.locator('.cat-card')).toHaveCount(5);

  expect(errors, errors.join(' | ')).toEqual([]);
});
