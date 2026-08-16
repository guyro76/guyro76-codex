import { test, expect, type Page } from '@playwright/test';
import { stubWikipedia } from './helpers';

/**
 * שיתוף התוצאה ורצף ימי המשחק — שתי התוספות שנוגעות בילד אחרי
 * שהמשחק נגמר, ולכן שתיהן נבדקות על מסלול משחק אמיתי ולא על מצב מלאכותי.
 *
 * הבדיקה החשובה כאן היא **מה בדיוק יוצא מהמכשיר**: לוכדים את הטקסט
 * שנמסר ל-Web Share ומוודאים שאין בו שום פרט מזהה. הבטחת פרטיות
 * שאינה נבדקת היא הבטחה שתישבר בשקט בעדכון הבא.
 */
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (/he\.wikipedia\.org|net::ERR|Failed to load resource/.test(msg.text())) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(String(err)));
  return errors;
}

/** משחק יחיד קצר עד מסך סיום המשחק */
async function playShortGame(page: Page): Promise<void> {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('heading', { name: 'אורי' }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /המשך לבחירת קטגוריות/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await expect(page.getByRole('button', { name: /מתחילים/ })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: /מתחילים/ }).click();

  // תשובה אחת מאומתת מהמאגר, דרך "גלו לי" — דטרמיניסטי ובלי רשת
  const card = page.locator('.cat-card').first();
  await card.getByRole('button', { name: /רמז/ }).click();
  await card.getByRole('button', { name: /עוד רמז/ }).click();
  await card.getByRole('button', { name: /גלו לי/ }).click();

  await page.getByRole('button', { name: /סיימתי/ }).click();
  await expect(page.getByRole('heading', { name: /תוצאות הסיבוב/ })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: /לתוצאות המשחק/ }).click();
  await expect(page.getByRole('heading', { name: 'סוף המשחק!' })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await stubWikipedia(page);
});

test('📤 שיתוף התוצאה מוסר טקסט נקי מכל פרט מזהה', async ({ page }) => {
  const errors = watchErrors(page);

  // מחליפים את Web Share בלוכד, כדי לראות בדיוק מה היה נשלח
  await page.addInitScript(() => {
    (window as unknown as { __shared: string[] }).__shared = [];
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: (data: { text: string }) => {
        (window as unknown as { __shared: string[] }).__shared.push(data.text);
        return Promise.resolve();
      }
    });
  });

  await playShortGame(page);

  await page.getByRole('button', { name: /שיתוף התוצאה/ }).click();
  await expect(page.getByText(/שותף!|הועתקה/)).toBeVisible();

  const shared = await page.evaluate(() => (window as unknown as { __shared: string[] }).__shared);
  expect(shared, 'לא נמסר שום טקסט לשיתוף').toHaveLength(1);
  const text = shared[0];

  // מה שכן צריך להיות שם
  expect(text).toContain('ארץ-עיר GO!');
  expect(text).toContain('אורי');
  expect(text).toContain('https://eretz-ir-go.vercel.app');

  // ומה שאסור שיהיה שם — זו עיקר הבדיקה
  expect(text, 'דלף מייל').not.toMatch(/@/);
  expect(text, 'דלף מזהה').not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/i);
  expect(text, 'דלף אסימון או כתובת שרת').not.toMatch(/supabase|token|apikey|Bearer/i);
  expect(text, 'דלף גיל השחקן').not.toMatch(/גיל/);

  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});

test('🔥 אחרי משחק ראשון מופיע רצף ימים במסך הבית', async ({ page }) => {
  const errors = watchErrors(page);

  await playShortGame(page);
  await page.getByRole('button', { name: /למסך הבית/ }).click();

  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();
  await expect(page.locator('.streak-chip')).toBeVisible();
  await expect(page.locator('.streak-chip')).toContainText(/רצף/);

  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});

test('📲 הצעת ההתקנה נסגרת ולא חוזרת', async ({ page }) => {
  // מדמים דפדפן שתומך בהתקנה — האירוע לא נורה מעצמו בכרום ללא ראש
  await page.addInitScript(() => {
    window.addEventListener('load', () => {
      const e = new Event('beforeinstallprompt') as Event & {
        prompt?: () => Promise<void>;
        userChoice?: Promise<{ outcome: string }>;
      };
      e.prompt = () => Promise.resolve();
      e.userChoice = Promise.resolve({ outcome: 'dismissed' });
      window.dispatchEvent(e);
    });
  });

  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('heading', { name: 'אורי' }).click();

  const card = page.locator('.install-card');
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'לא עכשיו' }).click();
  await expect(card).toHaveCount(0);

  // אחרי רענון היא לא חוזרת — באנר חוזר הוא מה שגורם למחוק אפליקציות.
  // הרענון מחזיר למסך הפתיחה, ולכן חוזרים למסך הבית באותו מסלול.
  await page.reload();
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('heading', { name: 'אורי' }).click();
  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();
  await expect(page.locator('.install-card')).toHaveCount(0);
});

test('🎯 לחיצה חוזרת על מצב משחק ממשיכה ישר הלאה', async ({ page }) => {
  // דווח מהשטח: "לוחץ על משחק יחיד וזה לא מתקדם". הלחיצה סימנה בלבד,
  // וכפתור ההמשך היה מתחת לקצה המסך.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('heading', { name: 'אורי' }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();

  const solo = page.getByRole('button', { name: /משחק יחיד/ }).first();
  // בחירה מפורשת: קודם מצב אחר, ואז חזרה ליחיד — כך "יחיד" אינו
  // עוד ברירת המחדל שכבר מסומנת אלא בחירה של ממש
  await page.getByRole('button', { name: /תרגול חופשי/ }).first().click();
  await solo.click();
  await expect(solo).toHaveAttribute('aria-pressed', 'true');

  // הלחיצה השנייה מתקדמת בלי לחפש את כפתור ההמשך
  await solo.click();
  await expect(page.getByRole('heading', { name: 'בחירת קטגוריות' })).toBeVisible({ timeout: 10_000 });
});

test('🤝 מצב שדורש יריב לא מדלג קדימה', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('heading', { name: 'אורי' }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();

  const duel = page.getByRole('button', { name: /דו-קרב/ }).first();
  await duel.click();
  await duel.click();
  await duel.click();
  // עדיין באותו מסך — חסרה בחירת יריב, ודילוג היה מוביל למסך חסר
  await expect(page.getByRole('heading', { name: 'איך משחקים היום?' })).toBeVisible();
});
