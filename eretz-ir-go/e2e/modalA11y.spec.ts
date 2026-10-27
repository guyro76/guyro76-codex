import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
import { disableServiceWorker, stubExternalSources } from './helpers';

/**
 * נגישות של חלון פתוח, ושל המבנה שסביבו.
 *
 * בדיקות axe הקיימות (`a11y.spec.ts`) סורקות מסכים. הן אף פעם לא
 * סרקו מסך **עם חלון פתוח** — ושם התקלות: הפוקוס נשאר על הכפתור
 * שמאחורי הרקע, Tab יצא מהחלון, הסגירה לא החזירה אותו, ול-
 * `role="dialog"` לא היה שם. אלה קריטריונים 2.4.3 ו-4.1.2, ו-axe לא
 * יכול לבדוק את הראשון בכלל: הוא דורש לחיצות מקלדת אמיתיות.
 */

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await disableServiceWorker(page);
  await stubExternalSources(page);
});

async function openHowTo(page: import('@playwright/test').Page) {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  // ההזמנה לראשונים נעלמת אחרי דילוג, והכפתור הקבוע נשאר — ואותו פותחים
  await page.getByRole('button', { name: /פעם ראשונה כאן/ }).click();
  await page.getByRole('button', { name: 'דילוג' }).click();
  const trigger = page.getByRole('button', { name: /איך משחקים/ });
  await trigger.click();
  return trigger;
}

test('♿ חלון פתוח: שם, פוקוס, לכידת Tab, Escape וחזרת הפוקוס', async ({ page }) => {
  const trigger = await openHowTo(page);
  const dialog = page.getByRole('dialog');

  // 1. יש חלון, והוא נקרא בשמו (הכותרת שבתוכו)
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleName('מגרילים אות');

  // 2. הפוקוס עבר פנימה, ולא נשאר על הכפתור שמאחור
  await expect(dialog).toBeFocused();

  // 3. Tab לא יוצא מהחלון — גם אחרי הרבה לחיצות
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    expect(
      await dialog.evaluate((d) => d.contains(document.activeElement)),
      `Tab מספר ${i + 1} הוציא את הפוקוס מהחלון`
    ).toBe(true);
  }
  // וגם Shift+Tab
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Shift+Tab');
    expect(
      await dialog.evaluate((d) => d.contains(document.activeElement)),
      `Shift+Tab מספר ${i + 1} הוציא את הפוקוס מהחלון`
    ).toBe(true);
  }

  // 4. Escape סוגר, והפוקוס חוזר בדיוק למי שפתח
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

/**
 * רשת ביטחון, לא הוכחה. נבדק מול ה-`Modal` הישן (חלון בלי שם נגיש,
 * בלי לכידת פוקוס): axe **לא דיווח עליו על שום דבר** ועבר. מה שבאמת
 * נועל את התיקון הוא הבדיקה שמעל, שנכשלת על הישן. כאן נתפסות הפרות
 * אחרות שיכולות להיכנס לתוכן של חלון בעתיד.
 */
test('♿ חלון פתוח עובר את axe בתקן WCAG AA', async ({ page }) => {
  await openHowTo(page);
  await expect(page.getByRole('dialog')).toBeVisible();

  const res = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    // ניגודיות נבדקת ב-tests/contrast.test.ts מתוך הטוקנים, כמו ב-a11y.spec
    .disableRules(['color-contrast'])
    .analyze();
  expect(
    res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
    'הפרות axe בזמן שחלון פתוח'
  ).toEqual([]);
});

test('♿ דילוג לתוכן: Tab ראשון בדף טרי מגיע אליו, ו-Enter מעביר לתוכן הראשי', async ({ page }) => {
  await page.goto('./');

  // יש בדיוק landmark אחד של תוכן ראשי
  await expect(page.locator('main')).toHaveCount(1);

  // Tab ראשון מתחילת הדף נוחת על הדילוג, והוא נראה בתוך המסך
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'דלגו לתוכן הראשי' });
  await expect(skip).toBeFocused();
  const box = await skip.boundingBox();
  const width = page.viewportSize()?.width ?? 0;
  expect(box && box.x >= 0 && box.x + box.width <= width, 'הדילוג מחוץ למסך').toBe(true);

  // Enter מעביר פוקוס ל-main, בלי להוסיף רשומה להיסטוריה (כפתור "חזרה")
  const before = await page.evaluate(() => history.length);
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  expect(await page.evaluate(() => history.length), 'הדילוג הוסיף רשומה להיסטוריה').toBe(before);
  expect(new URL(page.url()).hash).toBe('');
});

/**
 * אחרי מעבר מסך הכפתור שלחצו עליו נעלם מה-DOM. בלי טיפול, הפוקוס נופל
 * ל-body ו-Chrome ממשיך את ה-Tab הבא ממקום הכפתור שנעלם — לא מתחילת
 * המסך החדש. זו הבדיקה שמצאה את זה.
 */
test('♿ אחרי מעבר מסך הפוקוס עובר לתוכן, ו-Tab הבא נכנס לתוכו', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();

  await expect(page.locator('main')).toBeFocused();
  await page.keyboard.press('Tab');
  expect(
    await page.evaluate(() => document.getElementById('main-content')?.contains(document.activeElement)),
    'Tab אחרי מעבר מסך לא נכנס לתוכן החדש'
  ).toBe(true);
});

/**
 * השומר של ההעברה לתוכן: הוא פועל רק כשהפוקוס אבד.
 *
 * `history.back()` מחליף מסך בלי לגעת בפוקוס — בדיוק מה שנדרש כדי
 * להפריד בין שני המצבים. (כפתור החזרה של אנדרואיד מגיע לאותו מקום.)
 */
test('♿ העברת פוקוס לתוכן רק כשהפוקוס אבד — לא גוזלת אותו ממי שיש לו', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await expect(page.getByRole('heading', { name: 'איך משחקים היום?' })).toBeVisible();

  // פוקוס על אלמנט מחוץ ל-main (כמו כפתור בכותרת). חזרה אחורה מחליפה מסך.
  await page.evaluate(() => {
    const probe = document.createElement('button');
    probe.id = 'probe';
    probe.textContent = 'probe';
    document.body.appendChild(probe);
    probe.focus();
    history.back();
  });
  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();
  await expect(page.locator('#probe'), 'הפוקוס נגזל ממי שהחזיק אותו').toBeFocused();

  // ואם הפוקוס אבד (body) — הוא עובר לתוכן
  await page.evaluate(() => {
    document.getElementById('probe')?.remove();
    (document.activeElement as HTMLElement | null)?.blur();
    history.forward();
  });
  await expect(page.getByRole('heading', { name: 'איך משחקים היום?' })).toBeVisible();
  await expect(page.locator('main')).toBeFocused();
});
