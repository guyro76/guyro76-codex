import { test, expect, type Page } from '@playwright/test';
import { disableServiceWorker, stubExternalSources } from './helpers';

/**
 * אזהרה על צירוף קטגוריות דל — לפני ההגרלה ולא אחריה.
 *
 * הבדיקה הולכת בדיוק במסלול של ילד: מוריד את הקלאסיות, בוחר רק
 * קטגוריות של שמות פרטיים, רואה אזהרה, לוחץ על הכפתור — והאזהרה
 * **נעלמת**. השלב האחרון הוא העיקר: הנוסח הראשון של הכפתור הוסיף
 * שתי קלאסיות קבועות, ואלה לא הספיקו כדי לעבור את הרף.
 */

const CLASSICS = ['🌍 ארץ', '🏙️ עיר', '🦁 חי', '🌿 צומח', '🪨 דומם', '👦 שם של בן', '👧 שם של בת', '🧑‍🚒 מקצוע', '⭐ אישיות מפורסמת'];
const THIN = ['🎵 שיר', '🎸 להקה', '📚 ספר', '🎮 משחק מחשב', '🏆 קבוצת ספורט'];

async function gotoCategories(page: Page): Promise<void> {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await expect(page.getByRole('heading', { name: 'בחירת קטגוריות' })).toBeVisible();
}

const chip = (page: Page, label: string) => page.getByRole('button', { name: label, exact: true });
const warning = (page: Page) => page.getByRole('status').filter({ hasText: 'בצירוף הזה יש מעט מילים' });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await disableServiceWorker(page);
  await stubExternalSources(page);
});

test('🤔 צירוף דל מקבל אזהרה, והכפתור באמת מתקן אותו', async ({ page }) => {
  await gotoCategories(page);

  // ברירת המחדל היא תשע הקלאסיות — ואין שום אזהרה
  await expect(page.getByText(/נבחרו 9 מתוך/)).toBeVisible();
  await expect(warning(page)).toHaveCount(0);

  // ילד שאוהב מוזיקה ומשחקים: מוריד את כל הקלאסיות ובוחר רק שמות פרטיים
  for (const label of CLASSICS) await chip(page, label).click();
  for (const label of THIN) await chip(page, label).click();
  await expect(page.getByText(/נבחרו 5 מתוך/)).toBeVisible();

  await expect(warning(page)).toBeVisible();
  const fix = page.getByRole('button', { name: /להוסיף \d+ קטגוריות קלאסיות/ });
  await expect(fix).toBeVisible();

  // הכפתור אומר כמה יתווספו — ומוסיף בדיוק את זה
  const label = (await fix.textContent()) ?? '';
  const count = Number(label.match(/\d+/)?.[0]);
  expect(count).toBeGreaterThan(0);
  await fix.click();
  await expect(page.getByText(new RegExp(`נבחרו ${5 + count} מתוך`))).toBeVisible();

  // והעיקר: האזהרה נעלמה. כפתור "תיקון" שלא מתקן הוא באג.
  await expect(warning(page)).toHaveCount(0);
});

test('🤔 בכל ארבעת ה-presets אין אזהרה', async ({ page }) => {
  await gotoCategories(page);
  for (const preset of [/מהיר \(5\)/, /רגיל \(7\)/, /קלאסי \(9\)/, /מורחב \(12\)/]) {
    await page.getByRole('button', { name: preset }).click();
    await expect(warning(page)).toHaveCount(0);
  }
});
