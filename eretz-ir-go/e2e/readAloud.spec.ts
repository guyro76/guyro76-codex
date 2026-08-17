import { test, expect, type Page } from '@playwright/test';
import { stubWikipedia } from './helpers';

/**
 * הקראה בקול — הפיצ'ר לילדים שעדיין לא קוראים.
 *
 * שתי ההבטחות שנבדקות כאן הן בדיוק אלה שהמדיניות מצהירה עליהן:
 * כברירת מחדל שקט מוחלט, ואחרי ההפעלה מוקראים רק טקסטים של המשחק —
 * הקטגוריה והאות — ואף פעם לא מה שהילד הקליד.
 */

/** מחליף את speechSynthesis במרגל שסופר מה נאמר */
async function spyOnSpeech(page: Page) {
  await page.addInitScript(() => {
    const said: string[] = [];
    (window as unknown as { __said: string[] }).__said = said;
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak: (u: SpeechSynthesisUtterance) => said.push(u.text),
        cancel: () => {},
        getVoices: () => [{ lang: 'he-IL', name: 'Carmit' }]
      }
    });
    (window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = class {
      text: string;
      lang = '';
      rate = 1;
      pitch = 1;
      voice: unknown = null;
      constructor(text: string) {
        this.text = text;
      }
    };
  });
}

const said = (page: Page) => page.evaluate(() => (window as unknown as { __said: string[] }).__said);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await spyOnSpeech(page);
  await stubWikipedia(page);
});

/** מתחילים משחק יחיד קצר ומגיעים למסך הקטגוריות עם האות שהוגרלה */
async function startRound(page: Page) {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('heading', { name: 'אורי' }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await expect(page.getByRole('button', { name: /מתחילים/ })).toBeVisible({ timeout: 20_000 });
}

test('🔇 כברירת מחדל המשחק לא מדבר', async ({ page }) => {
  await startRound(page);
  expect(await said(page)).toEqual([]);
  // וגם אין כפתור רמקול על קלף הקטגוריה
  await page.getByRole('button', { name: /מתחילים/ }).click();
  await expect(page.getByRole('button', { name: /להקריא בקול/ })).toHaveCount(0);
});

test('🗣️ אחרי הפעלה בהגדרות — האות והקטגוריה מוקראות, והתשובה לא', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('heading', { name: 'אורי' }).click();
  await page.getByRole('button', { name: /הגדרות/ }).click();

  const toggle = page.getByRole('checkbox', { name: /הקראה בקול/ });
  await expect(toggle).toBeVisible();
  await toggle.check();

  // דוגמית מיד בהפעלה, כדי שההורה ישמע אם יש קול עברי במכשיר
  expect((await said(page)).length).toBe(1);

  await page.getByRole('button', { name: /חזרה|בית|🏠/ }).first().click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await expect(page.getByRole('button', { name: /מתחילים/ })).toBeVisible({ timeout: 20_000 });

  // האות שהוגרלה נאמרה בשמה ("האות היא אלף"), ולא כתו בודד
  const afterDraw = await said(page);
  expect(afterDraw.some((t) => /^האות היא .{2,}/.test(t))).toBe(true);

  await page.getByRole('button', { name: /מתחילים/ }).click();

  const speakers = page.getByRole('button', { name: /להקריא בקול/ });
  await expect(speakers.first()).toBeVisible();
  await speakers.first().click();

  const afterCategory = await said(page);
  expect(afterCategory[afterCategory.length - 1]).toMatch(/, באות /);

  // ההקלדה עצמה לא מוסיפה שום הקראה — זו ההבטחה במדיניות הפרטיות
  const before = (await said(page)).length;
  await page.locator('.cat-card input[type="text"]').first().fill('אבטיח');
  await page.waitForTimeout(400);
  const after = await said(page);
  expect(after.length).toBe(before);
  expect(after.join(' | ')).not.toContain('אבטיח');

  expect(errors, `שגיאות: ${errors.join(' | ')}`).toEqual([]);
});
