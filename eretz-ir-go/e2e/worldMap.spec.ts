import { test, expect } from '@playwright/test';
import { stubWikipedia } from './helpers';

/**
 * המפה האישית — מהתשובה במשחק ועד הנקודה שנדלקת.
 *
 * הבדיקה עוברת את כל השרשרת האמיתית: תשובה נכונה במשחק → שמירה
 * באוסף → זיהוי המקום → נקודה על המפה. אפשר היה לבדוק רק את
 * החישוב, אבל אז חוליה שבורה באמצע (למשל שם שנשמר אחרת ממה שהמפה
 * מחפשת) הייתה עוברת בשקט.
 */

/** מדינה מהמאגר לכל אות שאפשר להגריל */
const COUNTRY_BY_LETTER: Record<string, string> = {
  א: 'אנגליה',
  ב: 'ברזיל',
  ג: 'גרמניה',
  ד: 'דנמרק',
  ה: 'הודו',
  ו: 'וייטנאם',
  ז: 'זמביה',
  ח: 'חוף השנהב',
  ט: 'טורקיה',
  י: 'יוון',
  כ: 'כווית',
  ל: 'לבנון',
  מ: 'מצרים',
  נ: 'נורווגיה',
  ס: 'ספרד',
  ע: 'עיראק',
  פ: 'פולין',
  צ: 'צרפת',
  ק: 'קנדה',
  ר: 'רוסיה',
  ש: 'שוודיה',
  ת: 'תאילנד'
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await stubWikipedia(page);
});

test('🗺️ מדינה שנענתה נכון נדלקת על המפה באלבום', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('heading', { name: 'אורי' }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });

  // הקלף של "ארץ" — ממלאים בו מדינה שמתאימה לאות שהוגרלה
  const countryInput = page.locator('.cat-card').filter({ hasText: 'ארץ' }).locator('input').first();
  const placeholder = (await countryInput.getAttribute('placeholder')) ?? '';
  const letter = placeholder.match(/באות (.)/)?.[1] ?? '';
  const country = COUNTRY_BY_LETTER[letter];
  expect(country, `אין מדינה לאות ${letter}`).toBeTruthy();
  await countryInput.fill(country);

  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();
  // .first(): שם המדינה מופיע גם בשורת התוצאה וגם בעובדה שמתחתיה
  await expect(page.getByText(new RegExp(country)).first()).toBeVisible({ timeout: 30_000 });

  // חזרה הביתה ומשם לאלבום
  await page.getByRole('button', { name: 'לדף הבית' }).click();
  await page.getByRole('button', { name: /אוסף המילים/ }).click();

  const map = page.locator('.world-map');
  await expect(map).toBeVisible();
  await expect(page.getByText('🗺️ המפה שלי')).toBeVisible();

  // נקודה אחת לפחות, והיא ניתנת ללחיצה ומספרת מה נמצא שם
  const dot = page.locator('.wm-dot').first();
  await expect(dot).toBeVisible();
  await dot.click();
  // המסך מכיל גם הכרזה נסתרת לקוראי מסך; מכוונים לשורה הנראית שמתחת למפה
  const caption = page.locator('.card', { has: page.locator('.world-map') }).getByRole('status');
  await expect(caption).toContainText(country);
  await expect(caption).toContainText('מדינה');

  expect(errors, `שגיאות: ${errors.join(' | ')}`).toEqual([]);
});

test('🗺️ בלי מקומות באוסף אין מפה ריקה שתופסת מסך', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('heading', { name: 'אורי' }).click();
  await page.getByRole('button', { name: /אוסף המילים/ }).click();
  await expect(page.locator('.world-map')).toHaveCount(0);
});
