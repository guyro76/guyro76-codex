import { test, expect } from '@playwright/test';
import { disableServiceWorker, stubExternalSources } from './helpers';

/**
 * שער הורים לפני תוכן מסחרי — דרישת Google Play Families.
 *
 * קריאה לפעולה מסחרית לא אמורה להיות נגישה לילד ישירות. עד התיקון,
 * לחיצה על מצב משחק נעול בגרסה החינמית שלחה את הילד **ישר למסך
 * מחירים** עם מחירון מלא.
 *
 * הקוד של אזור ההורים לא התאים לתפקיד: הוא נקבע על ידי מי שמגיע
 * ראשון, כלומר ילד יכול לקבוע אותו בעצמו. שער שילד יכול לפתוח אינו
 * שער — ולכן כאן תרגיל כפל, כפי שגוגל עצמה מציעה.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await disableServiceWorker(page);
  await stubExternalSources(page);
});

async function openPricing(page: import('@playwright/test').Page) {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /הגדרות/ }).first().click();
  await page.getByRole('button', { name: /החבילות והמחירים/ }).click();
}

test('🔒 מסך המחירים חסום מאחורי שאלה שילד לא פותר', async ({ page }) => {
  await openPricing(page);

  // השער מוצג, והמחירים עדיין לא
  await expect(page.getByRole('heading', { name: /שאלה להורים/ })).toBeVisible();
  await expect(page.getByText(/₪/).first()).toHaveCount(0);

  // תשובה שגויה לא פותחת כלום
  await page.getByRole('textbox').fill('7');
  await page.getByRole('button', { name: /ממשיכים/ }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByText(/₪/).first()).toHaveCount(0);

  // התשובה הנכונה נקראת מהשאלה עצמה — כמו שהורה עושה
  const label = (await page.getByRole('textbox').getAttribute('aria-label')) ?? '';
  const [a, b] = label.match(/\d+/g)!.map(Number);
  await page.getByRole('textbox').fill(String(a * b));
  await page.getByRole('button', { name: /ממשיכים/ }).click();

  await expect(page.getByRole('heading', { name: /החבילות/ })).toBeVisible();
  await expect(page.getByText(/₪/).first()).toBeVisible();
});

/**
 * שער שנזכר שנפתח אינו שער: ילד שנכנס אחרי ההורה היה עובר בלי
 * להיתקל בכלום.
 */
test('🔒 השער נסגר מחדש בכל כניסה', async ({ page }) => {
  await openPricing(page);
  const label = (await page.getByRole('textbox').getAttribute('aria-label')) ?? '';
  const [a, b] = label.match(/\d+/g)!.map(Number);
  await page.getByRole('textbox').fill(String(a * b));
  await page.getByRole('button', { name: /ממשיכים/ }).click();
  await expect(page.getByRole('heading', { name: /החבילות/ })).toBeVisible();

  // יוצאים וחוזרים — והשער שוב שם
  await page.getByRole('button', { name: 'לדף הבית' }).click();
  await page.getByRole('button', { name: /הגדרות/ }).first().click();
  await page.getByRole('button', { name: /החבילות והמחירים/ }).click();
  await expect(page.getByRole('heading', { name: /שאלה להורים/ })).toBeVisible();
});

/** יציאה מהשער מחזירה למשחק, לא למסך ריק */
test('🔒 אפשר לצאת מהשער בחזרה למשחק', async ({ page }) => {
  await openPricing(page);
  await page.getByRole('button', { name: /חזרה למשחק/ }).click();
  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();
});
