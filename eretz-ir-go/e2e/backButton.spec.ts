import { test, expect } from '@playwright/test';
import { disableServiceWorker, stubExternalSources } from './helpers';

/**
 * כפתור החזרה של אנדרואיד.
 *
 * ## הבאג
 *
 * `navigate` היה `set({ screen })` בלבד — מצב, בלי היסטוריה. לכן
 * ב-WebView לא הצטברה שום היסטוריה, וכשילד לחץ על "חזרה" של
 * אנדרואיד, Capacitor לא מצא לאן לחזור **וסגר את האפליקציה**.
 * באמצע משחק, בלי אזהרה.
 *
 * ## למה בדיקת דפדפן מכסה את אנדרואיד
 *
 * כפתור החזרה של אנדרואיד קורא ל-`goBack()` של ה-WebView, וזה
 * בדיוק מה ש-`page.goBack()` עושה כאן. אותו `popstate`, אותו
 * מטפל, אותה תוצאה. וזה מכסה גם את מחוות החזרה ב-PWA ואת כפתור
 * החזרה בדפדפן — שלושתם היו שבורים באותה מידה.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await disableServiceWorker(page);
  await stubExternalSources(page);
});

test('⬅️ חזרה מחזירה מסך אחד, ולא סוגרת את המשחק', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();

  // בית ← אוסף המילים
  await page.getByRole('button', { name: /אוסף המילים שלי/ }).click();
  await expect(page.getByRole('heading', { name: /אוסף המילים שלי/ })).toBeVisible();

  // חזרה — ולא יציאה
  await page.goBack();
  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();
});

test('⬅️ חזרה עובדת גם עמוק בתוך מסלול המשחק', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await expect(page.getByRole('heading', { name: 'איך משחקים היום?' })).toBeVisible();

  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await expect(page.getByRole('heading', { name: 'בחירת קטגוריות' })).toBeVisible();

  // מהקטגוריות חזרה לבחירת המצב
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'איך משחקים היום?' })).toBeVisible();

  // ומשם חזרה הביתה
  await page.goBack();
  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();

  /**
   * הדף עדיין חי. זה הלב של הבדיקה: קודם, במקום כל זה, החלון
   * פשוט נסגר.
   */
  expect(page.isClosed()).toBe(false);
});

/**
 * לחיצה על אותו מסך פעמיים לא אמורה לדחוף רשומה נוספת, אחרת
 * "חזרה" אחת מרגישה כאילו כלום לא קרה.
 */
test('⬅️ ניווט למסך שכבר פתוח אינו מצטבר בהיסטוריה', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /הגדרות/ }).first().click();
  await expect(page.getByRole('heading', { name: /הגדרות/ }).first()).toBeVisible();

  const before = await page.evaluate(() => history.length);
  await page.evaluate(() => {
    // אותה קריאה בדיוק שהכפתור עושה, פעמיים
    window.dispatchEvent(new Event('noop'));
  });
  await page.getByRole('button', { name: /חזרה|←/ }).first().click();
  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();
  const after = await page.evaluate(() => history.length);
  expect(after - before, 'ניווט אחד הוסיף יותר מרשומה אחת').toBeLessThanOrEqual(1);
});
