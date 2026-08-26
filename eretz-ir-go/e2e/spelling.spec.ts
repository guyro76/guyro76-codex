import { test, expect } from '@playwright/test';
import { stubExternalSources } from './helpers';
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
  await stubExternalSources(page);
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
   * מילה אמיתית מהמאגר, עם אות אחת שהוחלפה **באמצע**.
   *
   * הגרסה הקודמת החליפה את האות האחרונה, וזו הייתה בדיוק סיבת
   * ההבהוב: החלפת אות אחרונה יוצרת לפעמים מילה אמיתית אחרת
   * ("ברזיל" ← "ברזים"), והמשחק מקבל אותה כתשובה תקינה במקום
   * להציע תיקון. אז הבדיקה נכשלה על אף שהמשחק התנהג נכון.
   *
   * החלפה באמצע כמעט אף פעם אינה יוצרת מילה קיימת, ומרחק העריכה
   * נשאר 1 — כלומר `isCloseMatch` עדיין מזהה. הבחירה גם מוודאת
   * מפורשות שהתוצאה אינה מילה שקיימת במאגר.
   */
  const known = new Set(SEED_ENTRIES.map((x) => x.n));
  const candidates = SEED_ENTRIES.filter(
    (x) => x.c.includes('country') && x.n.startsWith(letter) && x.n.length >= 5
  )
    // הפופולרית ביותר קודם: `isCloseMatch` בוחר מבין ההתאמות את
    // הפופולרית, ולכן ממנה הסיכוי הגבוה ביותר לקבל הצעה
    .sort((a, b) => (b.p ?? 0) - (a.p ?? 0));

  const pick = candidates
    .map((x) => {
      const i = Math.floor(x.n.length / 2);
      const swap = x.n[i] === 'ר' ? 'ל' : 'ר';
      return { typo: x.n.slice(0, i) + swap + x.n.slice(i + 1) };
    })
    .find((x) => !known.has(x.typo));

  test.skip(!pick, `אין מילת seed מתאימה לאות ${letter}`);
  const { typo } = pick!;

  await page.getByRole('textbox').first().fill(typo);
  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();

  /**
   * המשחק מזהה את השגיאה ומציע מילה — לא בהכרח זו שממנה נבנתה
   * השגיאה. `isCloseMatch` בוחר מבין ההתאמות הקרובות את הפופולרית
   * ביותר, ולכן "שוודיל" יכול להציע "שוויץ". מה שנבדק כאן הוא
   * שההצעה קיימת ושהיא נספרת, לא איזו מילה נבחרה.
   */
  const accept = page.getByRole('button', { name: /כן, התכוונתי/ });
  await expect(accept).toBeVisible({ timeout: 20_000 });
  const suggested = (await accept.innerText()).replace(/[^א-ת]/g, '').replace('כןהתכוונתיל', '');

  /**
   * `.round-score` ולא `.gold`: האחרונה היא מחלקת עזר שמופיעה גם
   * בכרטיס "קיבלתם חלק פאזל", שצץ אחת לכמה סיבובים — ואז הבדיקה
   * מדדה את הטקסט שלו במקום את הניקוד, ונכשלה באקראי.
   */
  const roundScore = page.locator('.round-score').first();
  const scoreBefore = Number((await roundScore.innerText()).replace(/\D/g, '') || '0');

  await accept.click();

  // התשובה נחשבת עכשיו, והכפתור נעלם כי אין יותר מה לאשר
  await expect(accept).toHaveCount(0);
  // ממוקד בשורת התשובה עצמה: המילה מופיעה גם בהכרזה לקורא המסך
  // וגם בעובדה שמתלווה לתשובה נכונה, ושתיהן אינן מה שנבדק כאן
  await expect(page.locator('.status-text-ok').filter({ hasText: suggested })).toBeVisible();

  const scoreAfter = Number((await roundScore.innerText()).replace(/\D/g, '') || '0');
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

  /**
   * מילה שהמאגר בוודאות לא מכיר — ובוודאות גם **לא קרובה** לאף
   * מילה שבו. מילה מומצאת "סתם" נופלת לפעמים בתוך מרחק עריכה 2
   * ממילה אמיתית, ואז המשחק מציע תיקון במקום לומר שאינו מכיר,
   * והבדיקה נכשלת באקראי. שלוש אותיות שנוספות למילה אמיתית
   * מרחיקות אותה מעבר לסף של `isCloseMatch`.
   */
  const seed = SEED_ENTRIES.find((x) => x.c.includes('country') && x.n.startsWith(letter))?.n;
  test.skip(!seed, `אין מילת seed לאות ${letter}`);
  await page.getByRole('textbox').first().fill(`${seed}סטן`);
  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();

  const learn = page.getByRole('button', { name: /להוסיף למילון שלי/ });
  await expect(learn).toBeVisible({ timeout: 25_000 });

  await learn.click();
  await expect(page.getByText(/בפעם הבאה המילה הזו כבר תיחשב/)).toBeVisible();
  await expect(page.getByRole('button', { name: /נוסף למילון שלי/ })).toBeDisabled();

  expect(errors, errors.join('\n')).toHaveLength(0);
});
