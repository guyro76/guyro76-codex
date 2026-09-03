import { test, expect, type Page } from '@playwright/test';
import { disableServiceWorker, stubExternalSources } from './helpers';

/**
 * קטגוריה אישית — המסך שאיש לא בדק.
 *
 * `CategoryCreate` הוא המקום היחיד במשחק שבו הילד כותב תוכן משלו,
 * והוא כותב אותו לשלוש טבלאות שונות: `customCategories`, המילון
 * האישי (`personalAnswers`) והמצב בזיכרון (`loadCustomCategories`).
 * מסך שנשמר לטבלה אחת ולא לשנייה נראה תקין בדיוק ברגע השמירה —
 * הקטגוריה "נוצרה" — ומתגלה כשבור רק אחרי שסוגרים את האפליקציה,
 * או כשמנסים לשחק איתה. לכן הבדיקה כאן לא מסתפקת ב"נשמר" אלא
 * הולכת עד הסוף: בחירה במסך הקטגוריות, כרטיס במסך המשחק,
 * מילות הפתיחה באוסף, והכול שורד לשונית חדשה.
 */

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (/he\.wikipedia\.org|net::ERR|Failed to load resource/.test(msg.text())) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(String(err)));
  return errors;
}

/** פתיחה → אזור אישי → בחירת מצב → מסך הקטגוריות */
async function gotoCategories(page: Page): Promise<void> {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await expect(page.getByRole('heading', { name: 'איך משחקים היום?' })).toBeVisible();
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await expect(page.getByRole('heading', { name: 'בחירת קטגוריות' })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await disableServiceWorker(page);
  await stubExternalSources(page);
});

test('⭐ קטגוריה אישית נשמרת, נבחרת למשחק ומגיעה ללוח', async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await gotoCategories(page);

  // --- יצירה ---
  await page.getByRole('button', { name: /קטגוריה אישית/ }).click();
  await expect(page.getByRole('heading', { name: 'קטגוריה אישית חדשה' })).toBeVisible();

  // כפתור השמירה חסום כל עוד אין שם — קטגוריה בלי שם אינה קטגוריה
  const saveBtn = page.getByRole('button', { name: /יצירת הקטגוריה/ });
  await expect(saveBtn).toBeDisabled();

  await page.getByLabel('שם הקטגוריה').fill('גיבורי על');
  await expect(saveBtn).toBeEnabled();
  // אייקון שאינו ברירת המחדל — כדי שהבדיקה תתפוס גם "האייקון לא נשמר"
  await page.getByRole('button', { name: '🛸', exact: true }).click();
  await page.getByLabel(/דוגמאות/).fill('סופרמן, וונדר וומן');
  await page.getByLabel(/רשימת מילים התחלתית/).fill('ספיידרמן, באטמן');
  await saveBtn.click();

  // --- חוזרים למסך הקטגוריות והיא שם ---
  await expect(page.getByRole('heading', { name: 'בחירת קטגוריות' })).toBeVisible();
  const chip = page.getByRole('button', { name: /גיבורי על/ });
  await expect(chip).toBeVisible();
  // הכוכב הוא הסימון של קטגוריה אישית ברשימה, והאייקון הוא זה שנבחר
  await expect(chip).toHaveText(/🛸 גיבורי על ⭐/);

  // --- בוחרים אותה למשחק ---
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await expect(page.getByText(/נבחרו 5 מתוך/)).toBeVisible();
  await chip.click();
  await expect(chip).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(/נבחרו 6 מתוך/)).toBeVisible();
  // היא נכנסה גם לרשימת "הסדר במשחק", אחרונה
  await expect(page.getByText('6. 🛸 גיבורי על')).toBeVisible();

  // --- והיא באמת מגיעה ללוח המשחק ---
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await expect(page.getByRole('button', { name: /מתחילים/ })).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: /מתחילים/ }).click();

  const cards = page.locator('.cat-card');
  await expect(cards.first()).toBeVisible();
  await expect(cards).toHaveCount(6);
  await expect(cards.last()).toContainText('גיבורי על');

  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});

/**
 * מילות הפתיחה אינן קישוט: הן נכתבות למילון האישי כדי שתשובה בקטגוריה
 * חדשה תיחשב נכונה בלי אינטרנט ובלי אישור הורה. הן נשמרות בלולאה
 * נפרדת מהקטגוריה עצמה — ולכן זה בדיוק המקום שבו חצי מהשמירה יכולה
 * להיכשל בשקט.
 *
 * הבדיקה גם מוודאת שהכול שורד סגירת אפליקציה. לשונית חדשה באותו
 * הקשר ולא `reload`, כי סקריפט האתחול של הבדיקות מוחק את מסד
 * הנתונים בכל טעינת דף.
 */
test('⭐ מילות הפתיחה נשמרות באוסף, והקטגוריה שורדת פתיחה מחדש', async ({ page }) => {
  await gotoCategories(page);
  await page.getByRole('button', { name: /קטגוריה אישית/ }).click();
  await page.getByLabel('שם הקטגוריה').fill('גיבורי על');
  await page.getByLabel(/רשימת מילים התחלתית/).fill('ספיידרמן, באטמן, אקוומן');
  await page.getByRole('button', { name: /יצירת הקטגוריה/ }).click();
  await expect(page.getByRole('heading', { name: 'בחירת קטגוריות' })).toBeVisible();

  // לשונית חדשה — בלי מחיקת מסד הנתונים, כלומר "פתחו את האפליקציה מחדש"
  const fresh = await page.context().newPage();
  await disableServiceWorker(fresh);
  await stubExternalSources(fresh);
  await fresh.goto('./');
  await fresh.getByRole('button', { name: /בואו נשחק/ }).click();

  // האוסף מכיל את שלוש מילות הפתיחה
  await fresh.getByRole('button', { name: /אוסף המילים שלי/ }).click();
  await expect(fresh.getByRole('heading', { name: /אוסף המילים שלי/ })).toBeVisible();
  await expect(fresh.locator('.word-card').first()).toBeVisible();
  await expect(fresh.getByText(/^3 מילים באוסף/)).toBeVisible();
  for (const word of ['ספיידרמן', 'באטמן', 'אקוומן']) {
    await expect(fresh.getByText(word, { exact: true })).toBeVisible();
  }

  // והקטגוריה עצמה עדיין קיימת בבחירת הקטגוריות
  await fresh.getByRole('button', { name: /חזרה|←/ }).first().click();
  await fresh.getByRole('button', { name: /משחק חדש/ }).click();
  await fresh.getByRole('button', { name: /משחק יחיד/ }).click();
  await expect(fresh.getByRole('button', { name: /גיבורי על/ })).toBeVisible();
});
