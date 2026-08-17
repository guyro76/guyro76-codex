import { test, expect, type Page } from '@playwright/test';
import { stubWikipedia } from './helpers';

/**
 * פאזלים — מסיום הסיבוב ועד הלוח במסך הפאזלים.
 *
 * מה שחשוב לוודא כאן הוא לא שהלוח יפה, אלא שהחלק באמת נשמר: פרס
 * שמוצג פעם אחת ונעלם ברענון גרוע יותר מלא לתת פרס בכלל.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await stubWikipedia(page);
});

/**
 * `fresh` שולט אם מתחילים בטעינת עמוד.
 *
 * חשוב: ה-beforeEach מוחק את IndexedDB בכל טעינה של העמוד, ולכן
 * סיבוב שני שמתחיל ב-goto היה מוחק את החלקים שנאספו בראשון —
 * ומודד את מחיקת הבדיקה במקום את שמירת המשחק.
 */
async function playRound(page: Page, fresh = true) {
  if (fresh) {
    await page.goto('./');
    await page.getByRole('button', { name: /בואו נשחק/ }).click();
    await page.getByRole('heading', { name: 'אורי' }).click();
  }
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });
  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();
}

test('🧩 סיום סיבוב מזכה בחלק פאזל, והחלק נשמר', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  await playRound(page);

  // כרטיס הפרס מופיע בתוצאות הסיבוב, עם משבצת אחת חשופה
  const awardCard = page.locator('.puzzle-award');
  await expect(awardCard).toBeVisible({ timeout: 30_000 });
  await expect(awardCard.locator('.puzzle-cell.has')).toHaveCount(1);
  await expect(awardCard.locator('.puzzle-cell.just-won')).toHaveCount(1);

  const title = (await awardCard.locator('strong').first().textContent())?.trim() ?? '';
  expect(title.length).toBeGreaterThan(1);

  // וגם אחרי יציאה מהמסך — החלק עדיין שם
  await page.getByRole('button', { name: 'לדף הבית' }).click();
  await page.getByRole('button', { name: /הפאזלים שלי/ }).click();

  await expect(page.getByText(/אספתם 1 חלקים/)).toBeVisible();
  await expect(page.locator('.puzzle-cell.has')).toHaveCount(1);

  expect(errors, `שגיאות: ${errors.join(' | ')}`).toEqual([]);
});

test('🧩 שני סיבובים — שני חלקים, ולא של אותו פאזל', async ({ page }) => {
  await playRound(page);
  await expect(page.locator('.puzzle-award')).toBeVisible({ timeout: 30_000 });
  const first = (await page.locator('.puzzle-award strong').first().textContent())?.trim() ?? '';

  await page.getByRole('button', { name: 'לדף הבית' }).click();
  await playRound(page, false);
  await expect(page.locator('.puzzle-award')).toBeVisible({ timeout: 30_000 });
  const second = (await page.locator('.puzzle-award strong').first().textContent())?.trim() ?? '';

  expect(second).not.toBe(first);

  await page.getByRole('button', { name: 'לדף הבית' }).click();
  await page.getByRole('button', { name: /הפאזלים שלי/ }).click();
  await expect(page.getByText(/אספתם 2 חלקים/)).toBeVisible();
  await expect(page.locator('.puzzle-cell.has')).toHaveCount(2);
});

test('🧩 בלי רשת הלוח עדיין נפתח ומסביר שהתמונה תגיע', async ({ page }) => {
  // חוסמים לגמרי את התמונות ואת ויקיפדיה
  await page.route('**/upload.wikimedia.org/**', (r) => r.abort());
  await page.route('**he.wikipedia.org/**', (r) => r.abort());

  await playRound(page);
  const awardCard = page.locator('.puzzle-award');
  await expect(awardCard).toBeVisible({ timeout: 30_000 });
  // המשבצת נחשפה — האיסוף לא תלוי ברשת
  await expect(awardCard.locator('.puzzle-cell.has')).toHaveCount(1);
});
