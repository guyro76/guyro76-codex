import { test, expect, type Page } from '@playwright/test';
import { disableServiceWorker, stubExternalSources } from './helpers';

/**
 * אזהרה על צירוף קטגוריות דל — לפני ההגרלה ולא אחריה.
 *
 * ## למה דווקא קטגוריות אישיות
 *
 * בגרסה הראשונה הבדיקה הזו בחרה חמש קטגוריות של שמות פרטיים (שיר,
 * להקה, ספר, משחק מחשב, קבוצת ספורט). אחר כך נוסף להן תוכן, והצירוף
 * הפסיק להיות דל: 2 אותיות כשירות מתוך 17 → 14. נבדק שאין כבר אף
 * צירוף של חמש מתוך עשר הקטגוריות הדלות ביותר שמקבל אזהרה.
 *
 * מה שעדיין יכול להיות דל הוא **קטגוריה שהילד המציא**: למזהה
 * `custom-<timestamp>` אין אף ערך במאגר, בשום אות. זה גם המקום שבו
 * התחיל כל הסבב — "רמז" שלא הגיב בקטגוריה אישית — ולכן זה המקרה
 * שהכי חשוב לבדוק.
 *
 * הבדיקה הולכת במסלול של ילד עד הסוף: האזהרה מופיעה, הכפתור אומר
 * כמה יתווספו, ואחרי הלחיצה האזהרה **נעלמת**. השלב האחרון הוא
 * העיקר — הנוסח הראשון של הכפתור לא תיקן כלום.
 */

const DESELECT = ['🦁 חי', '🌿 צומח', '🪨 דומם', '👦 שם של בן', '👧 שם של בת', '🧑‍🚒 מקצוע', '⭐ אישיות מפורסמת'];
const MINE = ['אוסף ראשון', 'אוסף שני', 'אוסף שלישי'];

async function gotoCategories(page: Page): Promise<void> {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await expect(page.getByRole('heading', { name: 'בחירת קטגוריות' })).toBeVisible();
}

async function createCategory(page: Page, name: string): Promise<void> {
  await page.getByRole('button', { name: /קטגוריה אישית/ }).click();
  await page.getByLabel('שם הקטגוריה').fill(name);
  await page.getByRole('button', { name: /יצירת הקטגוריה/ }).click();
  await expect(page.getByRole('heading', { name: 'בחירת קטגוריות' })).toBeVisible();
}

const warning = (page: Page) => page.getByRole('status').filter({ hasText: 'בצירוף הזה יש מעט מילים' });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await disableServiceWorker(page);
  await stubExternalSources(page);
});

test('🤔 צירוף של קטגוריות אישיות מקבל אזהרה, והכפתור באמת מתקן', async ({ page }) => {
  await gotoCategories(page);
  for (const name of MINE) await createCategory(page, name);

  // ברירת המחדל היא תשע הקלאסיות — ואין אזהרה
  await expect(page.getByText(/נבחרו 9 מתוך/)).toBeVisible();
  await expect(warning(page)).toHaveCount(0);

  // ילד שרוצה לשחק בקטגוריות שהמציא: משאיר רק ארץ ועיר ומוסיף את שלו
  for (const label of DESELECT) await page.getByRole('button', { name: label, exact: true }).click();
  for (const name of MINE) await page.getByRole('button', { name: new RegExp(name) }).click();
  await expect(page.getByText(/נבחרו 5 מתוך/)).toBeVisible();

  await expect(warning(page)).toBeVisible();
  const fix = page.getByRole('button', { name: /להוסיף \d+ קטגוריות קלאסיות/ });
  await expect(fix).toHaveText(/להוסיף 3 קטגוריות קלאסיות/);

  await fix.click();
  await expect(page.getByText(/נבחרו 8 מתוך/)).toBeVisible();
  // והעיקר: האזהרה נעלמה. כפתור "תיקון" שלא מתקן הוא באג.
  await expect(warning(page)).toHaveCount(0);
  // והקטגוריות של הילד נשארו — התיקון מוסיף, לא מחליף
  for (const name of MINE) {
    await expect(page.getByRole('button', { name: new RegExp(name) })).toHaveAttribute('aria-pressed', 'true');
  }
});

test('🤔 בכל ארבעת ה-presets אין אזהרה', async ({ page }) => {
  await gotoCategories(page);
  for (const preset of [/מהיר \(5\)/, /רגיל \(7\)/, /קלאסי \(9\)/, /מורחב \(12\)/]) {
    await page.getByRole('button', { name: preset }).click();
    await expect(warning(page)).toHaveCount(0);
  }
});

/**
 * הצירוף שהיה הגרוע ביותר — חמש קטגוריות של שמות פרטיים — נסגר
 * בתוכן. אם האזהרה חוזרת אליו, משהו נמחק מהמאגר.
 */
test('🤔 חמש קטגוריות של שמות פרטיים כבר לא מקבלות אזהרה', async ({ page }) => {
  await gotoCategories(page);
  for (const label of ['🌍 ארץ', '🏙️ עיר', '🦁 חי', '🌿 צומח', '🪨 דומם', '👦 שם של בן', '👧 שם של בת', '🧑‍🚒 מקצוע', '⭐ אישיות מפורסמת']) {
    await page.getByRole('button', { name: label, exact: true }).click();
  }
  for (const label of ['🎵 שיר', '🎸 להקה', '📚 ספר', '🎮 משחק מחשב', '🏆 קבוצת ספורט']) {
    await page.getByRole('button', { name: label, exact: true }).click();
  }
  await expect(page.getByText(/נבחרו 5 מתוך/)).toBeVisible();
  await expect(warning(page)).toHaveCount(0);
});
