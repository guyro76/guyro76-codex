import { test, expect } from '@playwright/test';
import { stubWikipedia } from './helpers';

/**
 * ערכות הצבע.
 *
 * לקובץ הזה אין מחיקת מסד נתונים בין הרצות — בכוונה. הבדיקה
 * המרכזית כאן היא שהבחירה **שורדת רענון**, ומחיקת האחסון בכל
 * טעינה הייתה מוחקת בדיוק את מה שנבדק.
 */
test.beforeEach(async ({ page }) => {
  await stubWikipedia(page);
});

const readBg = () => getComputedStyle(document.documentElement).getPropertyValue('--bg-mid').trim();

test('🎨 החלפת ערכה צובעת את כל הדף ושורדת רענון', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('heading', { name: 'אורי' }).first().click();
  await page.getByRole('button', { name: /הגדרות/ }).first().click();

  const bgOf = () => page.evaluate(readBg);
  const before = await bgOf();

  await page.getByRole('radio', { name: /ניאון לילה/ }).click();
  const after = await bgOf();
  expect(after, 'הערכה לא החליפה את צבע הרקע').not.toBe(before);
  await expect(page.getByRole('radio', { name: /ניאון לילה/ })).toHaveAttribute('aria-checked', 'true');

  // בלי זה הערכה היא אפקט ויזואלי חולף ולא הגדרה
  await page.reload();
  await expect.poll(bgOf, { timeout: 10_000 }).toBe(after);
});

test('🎨 כל הערכות נבחרות בפועל ואף אחת לא מפילה את הדף', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('heading', { name: 'אורי' }).first().click();
  await page.getByRole('button', { name: /הגדרות/ }).first().click();

  const options = page.getByRole('radio');
  const count = await options.count();
  expect(count, 'לא נמצאו ערכות צבע').toBeGreaterThanOrEqual(5);

  const seen = new Set<string>();
  for (let i = 0; i < count; i++) {
    await options.nth(i).click();
    const bg = await page.evaluate(readBg);
    expect(bg, `ערכה ${i} לא הגדירה צבע רקע`).toMatch(/#|rgb/);
    seen.add(bg);
  }
  // ערכות שונות חייבות באמת להיראות שונה
  expect(seen.size, 'יש ערכות שנראות זהות').toBeGreaterThanOrEqual(count - 1);

  expect(errors, `שגיאות: ${errors.join(' | ')}`).toEqual([]);
});
