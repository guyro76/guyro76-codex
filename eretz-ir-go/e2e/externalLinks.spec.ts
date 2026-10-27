import { test, expect, type Page } from '@playwright/test';
import { stubExternalSources } from './helpers';

/**
 * קישורים החוצה — מאחורי שער הורים.
 *
 * הקרדיט של תמונה מוביל לדף הקובץ בוויקישיתוף ולנוסח הרישיון. הרישיון
 * מחייב אותו, ולכן הוא נשאר; מה שהשתנה הוא שילד שלוחץ עליו לא יוצא
 * מהמשחק בלי מבוגר. מדיניות Google Play Families דורשת את זה, ומדיניות
 * הפרטיות הצהירה בלי כיסוי שאין קישורים כאלה.
 */

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await stubExternalSources(page);
  // יעדי הקישורים: חלון שנפתח שייך להקשר ולא לדף, ולכן חוסמים אותם שם
  await page.context().route(/(commons\.wikimedia\.org|creativecommons\.org)/, (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<title>stub</title>' })
  );
});

async function reachResults(page: Page) {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });
  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();
  await page.getByRole('heading', { name: /תוצאות הסיבוב/ }).waitFor({ timeout: 25_000 });
}

test('🔒 קישור קרדיט חיצוני לא נפתח בלי שער הורים, ונפתח אחריו', async ({ page }) => {
  const opened: string[] = [];
  page.context().on('page', (p) => opened.push(p.url()));

  await reachResults(page);

  const credit = page.locator('.puzzle-award .puzzle-credit');
  await expect(credit.first()).toBeVisible({ timeout: 30_000 });
  const link = credit.first().getByRole('link', { name: /^CC/ });

  // הקישור עדיין קישור אמיתי עם כתובת — כפי שהרישיון דורש
  await expect(link).toHaveAttribute('href', /^https:\/\/creativecommons\.org\//);

  // לחיצה: נפתח שער, לא אתר
  await link.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveAccessibleName('רגע, שאלה להורים');
  const input = dialog.getByRole('textbox');
  await expect(input).toBeFocused();
  expect(opened, 'האתר החיצוני נפתח לפני שעברו את השער').toEqual([]);

  // תשובה שגויה: הודעה, ועדיין שום דבר לא נפתח
  await input.fill('1');
  await dialog.getByRole('button', { name: 'ממשיכים' }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  expect(opened, 'האתר נפתח אחרי תשובה שגויה').toEqual([]);

  // תשובה נכונה (נקראת מהשאלה עצמה): נפתח האתר, בחלון נפרד
  const q = (await input.getAttribute('aria-label')) ?? '';
  const [, a, b] = q.match(/(\d+) כפול (\d+)/) ?? [];
  expect(a && b, `לא נמצאה שאלה בתווית: ${q}`).toBeTruthy();
  const popup = page.context().waitForEvent('page');
  await input.fill(String(Number(a) * Number(b)));
  await dialog.getByRole('button', { name: 'ממשיכים' }).click();
  expect((await popup).url()).toMatch(/^https:\/\/creativecommons\.org\//);
  await expect(dialog).toHaveCount(0);
});

test('🔒 ביטול בשער סוגר אותו ולא פותח כלום', async ({ page }) => {
  const opened: string[] = [];
  page.context().on('page', (p) => opened.push(p.url()));
  await reachResults(page);

  const credit = page.locator('.puzzle-award .puzzle-credit');
  await expect(credit.first()).toBeVisible({ timeout: 30_000 });
  await credit.first().getByRole('link', { name: /^CC/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'ביטול' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  // וגם Escape
  await credit.first().getByRole('link', { name: /^CC/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(opened).toEqual([]);
});
