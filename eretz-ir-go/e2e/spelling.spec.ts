import { test, expect } from '@playwright/test';
import { stubWikipedia } from './helpers';
import { SEED_ENTRIES } from '../src/data/seed';

/**
 * "כן, התכוונתי ל־X" — קבלת הצעת הכתיב של המשחק.
 *
 * זה היה הרגע הכי מתסכל במשחק: המשחק מציג "אולי התכוונת לחדרה?"
 * ובכל זאת נותן אפס. הבדיקה עוברת את המסלול האמיתי — הקלדה
 * שגויה, פסילה, לחיצה על ההצעה — ומוודאת שהניקוד באמת עלה.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await stubWikipedia(page);
});

test('✍️ תשובה שנפסלה על כתיב מתקבלת בלחיצה, והניקוד עולה', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });

  const letter = (await page.locator('.round-letter').first().innerText({ timeout: 10_000 })).trim().slice(0, 1);

  /**
   * מילה אמיתית מהמאגר של המשחק, עם אות אחת שהוחלפה. באורך 5 ומעלה
   * `isCloseMatch` מרשה מרחק 1, ולכן זו בדיוק שגיאת הכתיב שהמשחק
   * אמור לזהות — ולא ניחוש שעלול להתפרש אחרת.
   */
  const real = SEED_ENTRIES.find((x) => x.c.includes('country') && x.n.startsWith(letter) && x.n.length >= 5)?.n;
  test.skip(!real, `אין מילת seed באורך מספיק לאות ${letter}`);
  const typo = real!.slice(0, -1) + (real!.endsWith('ל') ? 'ם' : 'ל');

  await page.getByRole('textbox').first().fill(typo);
  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();

  // המשחק מזהה את השגיאה ומציע את המילה הנכונה
  const accept = page.getByRole('button', { name: new RegExp(`כן, התכוונתי.*${real}`) });
  await expect(accept).toBeVisible({ timeout: 20_000 });

  const scoreBefore = Number((await page.locator('.gold').first().innerText()).replace(/\D/g, '') || '0');

  await accept.click();

  // התשובה נחשבת עכשיו, והכפתור נעלם כי אין יותר מה לאשר
  await expect(accept).toHaveCount(0);
  // ממוקד בשורת התשובה עצמה: המילה מופיעה גם בהכרזה לקורא המסך
  // וגם בעובדה שמתלווה לתשובה נכונה, ושתיהן אינן מה שנבדק כאן
  await expect(page.locator('.status-text-ok').filter({ hasText: real! })).toBeVisible();

  const scoreAfter = Number((await page.locator('.gold').first().innerText()).replace(/\D/g, '') || '0');
  expect(scoreAfter, 'הניקוד לא עלה אחרי קבלת ההצעה').toBeGreaterThan(scoreBefore);

  expect(errors, errors.join('\n')).toHaveLength(0);
});

test('📗 תשובה לא מוכרת מציעה פעולה שהילד יכול לעשות בעצמו', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });

  const letter = (await page.locator('.round-letter').first().innerText({ timeout: 10_000 })).trim().slice(0, 1);
  // מילה תקינה מבחינת אות וקטגוריה, שהמאגר פשוט לא מכיר
  await page.getByRole('textbox').first().fill(`${letter}ורנדיה`);
  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();

  const learn = page.getByRole('button', { name: /להוסיף למילון שלי/ });
  await expect(learn).toBeVisible({ timeout: 25_000 });

  await learn.click();
  await expect(page.getByText(/בפעם הבאה המילה הזו כבר תיחשב/)).toBeVisible();
  await expect(page.getByRole('button', { name: /נוסף למילון שלי/ })).toBeDisabled();

  expect(errors, errors.join('\n')).toHaveLength(0);
});
