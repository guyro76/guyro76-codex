import { test, expect } from '@playwright/test';

/**
 * תמונות אחרי שהמילה נחשפה ואושרה.
 *
 * ויקיפדיה וויקישיתוף חסומות בסביבת הבדיקה, ולכן כאן מיירטים את הקריאות
 * ומחזירים תשובה בפורמט האמיתי של ה-API. מה שנבדק הוא הצינור שלנו:
 * תשובה שאושרה → חיפוש תמונה → הצגה עם קרדיט ומקור → שמירה במטמון
 * המקומי כך שבפעם הבאה אין בכלל בקשת רשת.
 */

const PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));

  /**
   * מנטרלים את ה-Service Worker בבדיקה הזו בלבד.
   *
   * מאז שהמשחק עודכן לעדכון אוטומטי, ה-SW משתלט על הדף כבר בטעינה
   * הראשונה ומיירט את בקשות התמונות מוויקישיתוף — כולל אלה שהבדיקה
   * מזייפת. הבדיקה כאן בודקת את צינור התמונות שלנו, לא את המטמון
   * של ה-SW, ולכן היא צריכה רשת "נקייה".
   */
  await page.addInitScript(() => {
    if ('serviceWorker' in navigator) {
      Object.defineProperty(navigator, 'serviceWorker', {
        configurable: true,
        value: { register: () => Promise.reject(new Error('disabled in test')), ready: new Promise(() => {}) }
      });
    }
  });

  let searches = 0;
  await page.route('**he.wikipedia.org/w/api.php**', async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get('list') === 'search') {
      searches++;
      const term = url.searchParams.get('srsearch') ?? '';
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ query: { search: [{ title: term }] } })
      });
      return;
    }
    // ה-API מחזיר עמוד לכל כותרת ברשימה המופרדת ב-| — וכך גם כאן
    const titles = (url.searchParams.get('titles') ?? '').split('|').filter(Boolean);
    const pages = Object.fromEntries(
      titles.map((title, i) => [
        String(i + 1),
        {
          title,
          // ערך הבדיקה נושא סימנים לכל חמש הקטגוריות של הסבב המהיר,
          // כדי שיעבור את שער התאמת-הנושא בלי קשר לקטגוריה שהוגרלה.
          // האימות עצמו נבדק לעומק ב-tests/imageVerify.test.ts.
          extract: `${title} — מדינה, עיר, בעל חיים, צמח, כלי לבדיקה`,
          fullurl: `https://he.wikipedia.org/wiki/${encodeURIComponent(title)}`,
          thumbnail: { source: PIXEL }
        }
      ])
    );
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ query: { pages } }) });
  });
  await page.exposeFunction('__searchCount', () => searches);
});

test('🖼️ תשובה שאושרה מציגה תמונה אמיתית עם קרדיט, ונשמרת למטמון', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(String(err)));

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
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });

  // ממלאים תשובה אחת בעזרת ארצי — "נחשפת ומאושרת" בדיוק כמו בבקשה
  const card = page.locator('.cat-card').first();
  await card.getByRole('button', { name: /רמז/ }).click();
  await card.getByRole('button', { name: /עוד רמז/ }).click();
  await card.getByRole('button', { name: /גלו לי/ }).click();

  await page.getByRole('button', { name: /סיימתי/ }).click();
  await expect(page.getByRole('heading', { name: /תוצאות הסיבוב/ })).toBeVisible({ timeout: 20_000 });

  // התמונה מוצגת ליד תשובה נכונה, יחד עם שורת המקור
  // סוגרים את חלון "מצאת מילה חדשה" אם נפתח, כדי לבדוק את שורות התשובות
  const closeNew = page.getByRole('button', { name: /מעולה|למילה הבאה/ });
  while (await closeNew.first().isVisible().catch(() => false)) {
    await closeNew.first().click();
    await page.waitForTimeout(200);
  }

  const figure = page.locator('figure').first();
  await expect(figure).toBeVisible({ timeout: 20_000 });
  await expect(figure.locator('img')).toHaveAttribute('src', PIXEL);
  await expect(figure.getByText(/📷/)).toBeVisible();

  // לחיצה פותחת תצוגה מוגדלת עם הקרדיט המלא וקישור לעמוד המקור
  await figure.locator('img').click();
  await expect(page.getByText(/מקור:/)).toBeVisible();
  await expect(page.getByRole('link', { name: /לעמוד המקור/ })).toBeVisible();
  await page.getByRole('button', { name: 'סגירה' }).click();

  // מכאן ואילך כל פנייה לוויקיפדיה נכשלת. התמונה עדיין חייבת להופיע
  // באוסף המילים — כלומר היא באמת נשמרה מקומית ועובדת גם בלי רשת.
  const searchesDuringRound = await page.evaluate(() =>
    (window as never as { __searchCount: () => Promise<number> }).__searchCount()
  );
  expect(searchesDuringRound).toBeGreaterThan(0);
  await page.route('**he.wikipedia.org/**', (route) => route.abort());

  await page.getByRole('button', { name: /לתוצאות המשחק/ }).click();
  await page.getByRole('button', { name: 'למסך הבית' }).click();
  await page.getByRole('button', { name: /אוסף המילים שלי/ }).click();
  await expect(page.locator('.word-card figure img').first()).toBeVisible({ timeout: 20_000 });

  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});
