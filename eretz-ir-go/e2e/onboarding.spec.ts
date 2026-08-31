import { test, expect } from '@playwright/test';
import { disableServiceWorker, stubExternalSources } from './helpers';

/**
 * הפנייה הראשונה לילד חדש.
 *
 * עד התיקון נוצר פרופיל בשם **"אורי"**, ולכן הדבר הראשון שילד ראה
 * היה "בוקר טוב, אורי!" — שמו של מישהו אחר. עכשיו הברכה לא ממציאה
 * שם, והמסך מזמין לבחור אחד — **בלי לחסום**: מי שרוצה פשוט מתחיל
 * לשחק.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await disableServiceWorker(page);
  await stubExternalSources(page);
});

test('👋 שחקן חדש לא מקבל שם של מישהו אחר', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();

  // הברכה בלי שם מומצא
  await expect(page.getByRole('heading', { name: /אורי/ })).toHaveCount(0);

  // ובקשה לבחור שם
  await expect(page.getByText(/איך קוראים לך/)).toBeVisible();
});

test('👋 בחירת שם מעדכנת את הפנייה, והבקשה נעלמת', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();

  await page.getByRole('textbox', { name: 'השם שלי' }).fill('דנה');
  await page.getByRole('button', { name: 'זהו!' }).click();

  await expect(page.getByRole('heading', { name: /דנה/ })).toBeVisible();
  await expect(page.getByText(/איך קוראים לך/)).toHaveCount(0);
});

/**
 * הבקשה אינה חוסמת: אפשר להתעלם ממנה ולשחק. זו הסיבה שהיא כרטיס
 * במסך הבית ולא מסך בפני עצמו.
 */
test('👋 אפשר לשחק בלי לבחור שם בכלל', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await expect(page.getByRole('heading', { name: 'איך משחקים היום?' })).toBeVisible();
});


/**
 * ההסבר "איך משחקים".
 *
 * הניסיון הראשון היה חלון שנפתח מעצמו בכניסה — והוא חסם את המשחק
 * וגם נערם על בקשת השם באותו מסך. שתי הפרעות לפני שמשחקים בכלל
 * הן הדרך הבטוחה לגרום לילד לסגור את שתיהן בלי לקרוא.
 */
test('❓ ההסבר זמין, לא חוסם, ונקרא עד הסוף', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();

  // ההזמנה מופיעה — אבל המשחק נגיש מאחוריה
  await expect(page.getByRole('button', { name: /פעם ראשונה כאן/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeEnabled();

  await page.getByRole('button', { name: /פעם ראשונה כאן/ }).click();
  await expect(page.getByRole('heading', { name: 'מגרילים אות' })).toBeVisible();

  // ארבעה עמודים, וכפתור אחרון אחר
  await page.getByRole('button', { name: /הבא/ }).click();
  await page.getByRole('button', { name: /הבא/ }).click();
  await page.getByRole('button', { name: /הבא/ }).click();
  await expect(page.getByRole('heading', { name: /אוספים תוך כדי/ })).toBeVisible();
  await page.getByRole('button', { name: /יאללה, משחקים/ }).click();

  // ההזמנה נעלמת, והכפתור הקבוע נשאר
  await expect(page.getByRole('button', { name: /פעם ראשונה כאן/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /איך משחקים/ })).toBeVisible();
});

/** אפשר לדלג באמצע, וזה נחשב כאילו נכנסנו */
test('❓ אפשר לדלג על ההסבר', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /פעם ראשונה כאן/ }).click();
  await page.getByRole('button', { name: 'דילוג' }).click();
  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();
});
