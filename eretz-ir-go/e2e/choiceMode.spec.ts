import { test, expect } from '@playwright/test';
import { stubWikipedia } from './helpers';

/**
 * מצב בחירה — הדרך של ילד בן ארבע לשחק לבד.
 *
 * מה שנבדק כאן הוא לא רק שהכפתורים מופיעים, אלא שהבחירה בהם
 * באמת נספרת כתשובה. מצב שמציג ארבע אפשרויות ולא רושם את מה
 * שנבחר גרוע יותר מלא להציע אותו בכלל.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await stubWikipedia(page);
});

async function toRound(page: import('@playwright/test').Page, choice: boolean) {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.locator('select').first().selectOption('1');
  const toggle = page.getByRole('switch', { name: 'מצב בחירה' });
  if ((await toggle.getAttribute('aria-checked')) !== String(choice)) await toggle.click();
  await expect(toggle).toHaveAttribute('aria-checked', String(choice));
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });
}

test('🧒 במצב בחירה בוחרים אפשרות והיא נספרת כתשובה', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  await toRound(page, true);

  // אין הקלדה בקלף שיש בו אפשרויות
  const firstCard = page.locator('.cat-card').filter({ has: page.locator('.choice-grid') }).first();
  await expect(firstCard).toBeVisible();
  await expect(firstCard.locator('input[type="text"]')).toHaveCount(0);

  const options = firstCard.locator('.choice-btn');
  await expect(options).toHaveCount(4);

  const chosen = (await options.first().textContent())?.replace('🔊', '').trim() ?? '';
  await options.first().click();
  await expect(options.first()).toHaveAttribute('aria-checked', 'true');

  // לחיצה חוזרת מבטלת — ילד שלחץ בטעות צריך דרך לחזור בו
  await options.first().click();
  await expect(options.first()).toHaveAttribute('aria-checked', 'false');
  await options.first().click();

  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();
  await expect(page.getByText(new RegExp(chosen)).first()).toBeVisible({ timeout: 30_000 });

  expect(errors, `שגיאות: ${errors.join(' | ')}`).toEqual([]);
});

test('⌨️ בלי מצב בחירה נשארים בהקלדה רגילה', async ({ page }) => {
  await toRound(page, false);
  await expect(page.locator('.choice-grid')).toHaveCount(0);
  await expect(page.locator('.cat-card input[type="text"]').first()).toBeVisible();
});
