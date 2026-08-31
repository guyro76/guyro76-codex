import { test, expect } from '@playwright/test';
import { stubExternalSources } from './helpers';

/**
 * משחק נגד ארצי — מסלול מלא מבחירת המצב ועד טבלת התוצאות.
 *
 * זה המצב שבו יש שני שחקנים אבל רק אדם אחד מול המכשיר, ולכן דווקא
 * כאן קל לשבור את זרימת התורות: תור שלא עובר, תשובות שנכתבות
 * לשחקן הלא נכון, או מסך שנתקע כי אין למי להעביר את המכשיר.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await stubExternalSources(page);
});

test('🤖 סיבוב מלא נגד ארצי מסתיים בטבלה עם שני שחקנים', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));

  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.locator('select').first().selectOption('1');

  // בחירת המצב מתקדמת מיד — בלי לבקש יריב, כי היריב הוא ארצי
  await page.getByRole('button', { name: /נגד ארצי/ }).click();
  await expect(page.getByRole('button', { name: /מהיר \(5\)/ })).toBeVisible();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });

  // תשובה אחת של השחקן ואז סיום התור
  await page.locator('.cat-card input[type="text"]').first().fill('אבטיח');
  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();

  // התור עובר לארצי — ולא למסך "העבירו את המכשיר"
  await expect(page.getByRole('heading', { name: /ארצי/ })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/מעבירים את המכשיר/)).toHaveCount(0);

  // מזרזים אותו במקום לחכות לכל ההשהיות
  await page.getByRole('button', { name: /שיזדרז/ }).click();
  await page.getByRole('button', { name: /לתוצאות הסיבוב/ }).click();

  // בטבלת הסיבוב מופיעים שני השחקנים
  await expect(page.getByText('ארצי').first()).toBeVisible({ timeout: 25_000 });
  // שם ברירת המחדל הוא תווית ולא שם של אדם — ראו DEFAULT_PROFILE_NAME
  await expect(page.getByText('שחקן חדש').first()).toBeVisible();

  expect(errors, `שגיאות: ${errors.join(' | ')}`).toEqual([]);
});

test('🤖 ארצי עונה תשובות אמיתיות באות שהוגרלה', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /נגד ארצי/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });

  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();
  await page.getByRole('button', { name: /שיזדרז/ }).click({ timeout: 15_000 });

  const letter = (await page.getByTestId('bot-letter').textContent())?.trim() ?? '';
  expect(letter).toHaveLength(1);

  // לפחות תשובה אחת אמיתית, וכולן באות שהוגרלה
  const answers = (await page.locator('.bot-answer').allTextContents())
    .map((a) => a.trim())
    .filter((a) => a && a !== '…' && !a.includes('ידע'));
  expect(answers.length).toBeGreaterThan(0);
  for (const a of answers) expect(a.startsWith(letter)).toBe(true);
});
