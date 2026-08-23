import { test, expect, type Page } from '@playwright/test';
import { stubWikipedia } from './helpers';

/** מצבי המשחק המהירים והמיוחדים — כל אחד נבדק עד לתחילת משחק אמיתית */

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(String(err)));
  return errors;
}

/** פתיחה → ישר לאזור האישי → מסך בחירת המצב */
async function gotoModeSelect(page: Page) {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await expect(page.getByRole('heading', { name: 'איך משחקים היום?' })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await stubWikipedia(page);
});

test('⚡ ראש בראש: תשובה נכונה מוסיפה ניקוד, שגויה לא', async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await gotoModeSelect(page);
  // לחיצה על מצב מתקדמת ישירות למסך שלו
  await page.getByRole('button', { name: /ראש בראש/ }).click();

  // מסך הפתיחה של הבליץ מציג קטגוריה ואות
  await expect(page.getByText(/שניות\./)).toBeVisible();
  const letter = (await page.locator('div').filter({ hasText: /^[א-ת]$/ }).last().innerText()).trim();
  await page.getByRole('button', { name: /מוכנה|מוכן|מתחילים/ }).click();

  // תשובת ג'יבריש נפסלת ומופיעה ברשימה עם ❌
  const input = page.getByRole('textbox', { name: 'תשובה' });
  await expect(input).toBeVisible();
  await input.fill(letter.repeat(4));
  await page.getByRole('button', { name: 'שליחה' }).click();
  await expect(page.getByText('❌').first()).toBeVisible();

  // הניקוד נשאר 0
  await expect(page.getByText('⭐ 0')).toBeVisible();

  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});

test('🔗 שרשרת: החוליה הראשונה נדרשת באות שהוגרלה', async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await gotoModeSelect(page);
  // לחיצה על מצב מתקדמת ישירות למסך שלו
  await page.getByRole('button', { name: /שרשרת/ }).click();

  await expect(page.getByText(/כל תשובה מתחילה באות האחרונה/)).toBeVisible();
  await page.getByRole('button', { name: /מוכנה|מוכן|מתחילים/ }).click();

  // מוצגת האות הנדרשת לחוליה הבאה
  await expect(page.getByText(/החוליה הבאה מתחילה ב/)).toBeVisible();
  const input = page.getByRole('textbox', { name: /החוליה הבאה/ });
  await expect(input).toBeVisible();

  // חוליה באות שגויה נדחית עם הסבר, והשרשרת נשארת ריקה
  await input.fill('קקקק');
  await page.getByRole('button', { name: 'חיבור' }).click();
  await expect(page.locator('.status-text-bad')).toBeVisible();
  await expect(page.getByText('🔗 0 חוליות')).toBeVisible();

  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});

test('🎴 קלף מסתורי: הקטגוריות נחשפות רק אחרי הגרלת האות', async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await gotoModeSelect(page);
  // לחיצה על מצב מתקדמת ישירות למסך שלו
  await page.getByRole('button', { name: /קלף מסתורי/ }).click();

  // לפני ההגרלה — אין חשיפה
  await expect(page.locator('.letter-wheel')).toBeVisible();
  await expect(page.getByText('🎴 הקלפים נחשפים!')).toHaveCount(0);

  await page.locator('.letter-wheel').click();
  await expect(page.getByRole('button', { name: /מתחילים/ })).toBeVisible({ timeout: 15_000 });

  // אחרי ההגרלה — 5 קטגוריות נחשפות
  await expect(page.getByText('🎴 הקלפים נחשפים!')).toBeVisible();
  await page.getByRole('button', { name: /מתחילים/ }).click();
  await expect(page.locator('.cat-card')).toHaveCount(5);

  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});
