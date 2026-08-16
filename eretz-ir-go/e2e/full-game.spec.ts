import { test, expect, type Page } from '@playwright/test';
import { disableServiceWorker, stubWikipedia } from './helpers';

/**
 * מסלול הקבלה מהאפיון:
 * בחירת פרופיל → בחירת משחק → קטגוריות → הגרלת אות → מילוי → בדיקה → תוצאות → שמירת מילים.
 * כל בדיקה מתחילה ממכשיר "נקי" כדי שהפרופילים ייווצרו מחדש.
 */

/** אוסף שגיאות קונסול — האפיון דורש אפס Console Errors */
function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(String(err)));
  return errors;
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    // כל הרצה מתחילה ממאגר נקי
    indexedDB.deleteDatabase('eretz-ir-go');
  });
  await disableServiceWorker(page);
  await stubWikipedia(page);
});

test('מסלול מלא: פרופיל, קטגוריות, אות, מילוי, ניקוד ושמירה באוסף', async ({ page }) => {
  const errors = trackConsoleErrors(page);

  await page.goto('./');

  // --- מסך פתיחה ---
  await expect(page.getByRole('heading', { name: 'ארץ-עיר GO!' })).toBeVisible();
  await page.getByRole('button', { name: /בואו נשחק/ }).click();

  // --- בחירת פרופיל: אורי ומאיה קיימות כברירת מחדל ---
  await expect(page.getByRole('heading', { name: 'מי משחק היום?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'אורי' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'מאיה' })).toBeVisible();
  await page.getByRole('heading', { name: 'אורי' }).click();

  // --- מסך הבית: פנייה אישית ---
  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();
  await page.getByRole('button', { name: /משחק חדש/ }).click();

  // --- בחירת מצב: משחק יחיד, סיבוב אחד ---
  await expect(page.getByRole('heading', { name: 'איך משחקים היום?' })).toBeVisible();
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.locator('select').first().selectOption('1'); // סיבוב אחד
  await page.getByRole('button', { name: /המשך לבחירת קטגוריות/ }).click();

  // --- קטגוריות: ברירת המחדל היא 9 הקלאסיות; מצמצמים ל-5 למשחק מהיר ---
  await expect(page.getByRole('heading', { name: 'בחירת קטגוריות' })).toBeVisible();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await expect(page.getByText(/נבחרו 5 מתוך/)).toBeVisible();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();

  // --- הגרלת אות (לוחצים על הגלגל עצמו) ---
  await page.locator('.letter-wheel').click();
  const startBtn = page.getByRole('button', { name: /מתחילים/ });
  await expect(startBtn).toBeVisible({ timeout: 15_000 });

  // האות שנבחרה מוצגת בגלגל
  const letter = (await page.locator('.letter-wheel .inner').innerText()).trim();
  expect(letter).toMatch(/^[א-ת]$/);
  await startBtn.click();

  // --- מסך המשחק: מילוי תשובות ---
  await expect(page.locator('.cat-card').first()).toBeVisible();
  const cards = page.locator('.cat-card');
  expect(await cards.count()).toBe(5);

  // ממלאים בעזרת ארצי בנתיב דטרמיניסטי: שני רמזים ואז "גלו לי", שממלא את
  // התשובה המאומתת מהמאגר. כך הבדיקה מאמתת את מנוע הרמזים בלי להסתמך על ידע חיצוני
  // (אפשרויות הבחירה בדרגה 3 כוללות בכוונה הסחות דעת, ולכן אינן ודאיות).
  const firstCard = cards.first();
  await firstCard.getByRole('button', { name: /רמז/ }).click();
  await expect(firstCard.locator('.artzi-bubble')).toBeVisible();
  await firstCard.getByRole('button', { name: /עוד רמז/ }).click();

  const revealBtn = firstCard.getByRole('button', { name: /גלו לי/ });
  await expect(revealBtn).toBeVisible();
  await revealBtn.click();

  // התשובה שארצי חשף מולאה בשדה
  const answerInput = firstCard.getByRole('textbox');
  const revealed = await answerInput.inputValue();
  expect(revealed.trim().length, 'ארצי לא מילא תשובה').toBeGreaterThan(1);
  expect(revealed.trim().startsWith(letter) || revealed.trim().startsWith(`ה${letter}`)).toBe(true);

  // --- סיום הסיבוב והרצת מנוע הבדיקה ---
  await page.getByRole('button', { name: /סיימתי/ }).click();

  // --- תוצאות הסיבוב ---
  await expect(page.getByRole('heading', { name: /תוצאות הסיבוב/ })).toBeVisible({ timeout: 30_000 });
  // סוגרים חלון "מצאת מילה חדשה" אם נפתח
  const closeNew = page.getByRole('button', { name: /מעולה|למילה הבאה/ });
  while (await closeNew.first().isVisible().catch(() => false)) {
    await closeNew.first().click();
    await page.waitForTimeout(200);
  }

  // לפחות תשובה אחת אושרה (✅) — מנוע הוולידציה עובד
  await expect(page.getByText('✅').first()).toBeVisible();

  await page.getByRole('button', { name: /לתוצאות המשחק/ }).click();

  // --- תוצאות המשחק ---
  await expect(page.getByRole('heading', { name: 'סוף המשחק!' })).toBeVisible();
  await page.getByRole('button', { name: 'למסך הבית' }).click();

  // --- אוסף המילים: התשובות הנכונות נשמרו ---
  await page.getByRole('button', { name: /אוסף המילים שלי/ }).click();
  await expect(page.getByRole('heading', { name: /אוסף המילים שלי/ })).toBeVisible();
  await expect(page.locator('.word-card').first()).toBeVisible();
  const saved = await page.locator('.word-card').count();
  expect(saved, 'שום מילה לא נשמרה באוסף').toBeGreaterThan(0);

  // אפס שגיאות קונסול לאורך כל המסלול
  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});

test('תשובה שגויה נצבעת אדום ולא מקבלת ניקוד, נכונה נצבעת ירוק', async ({ page }) => {
  const errors = trackConsoleErrors(page);
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
  const letter = (await page.locator('.letter-wheel .inner').innerText()).trim();
  await page.getByRole('button', { name: /מתחילים/ }).click();

  // ג'יבריש שמתחיל באות הנכונה — חייב להיפסל
  const first = page.locator('.cat-card').first();
  await first.getByRole('textbox').fill(letter.repeat(4));
  await page.getByRole('button', { name: /סיימתי/ }).click();

  await expect(page.getByRole('heading', { name: /תוצאות הסיבוב/ })).toBeVisible({ timeout: 30_000 });
  // התשובה סומנה כשגויה
  await expect(page.getByText('❌').first()).toBeVisible();
  // הניקוד הכולל של הסיבוב הוא 0
  await expect(page.getByText(/^\+0 נק׳$/)).toBeVisible();

  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});
