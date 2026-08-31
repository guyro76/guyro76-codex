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


/**
 * "מה חדש" אחרי עדכון.
 *
 * הכלל שמחזיק את זה: **התקנה חדשה לא מקבלת "מה חדש"** — אין "חדש"
 * ביחס לכלום, ולשחקן חדש יש ממילא את "איך משחקים". רק מי שכבר
 * ראה גרסה קודמת מקבל את הרשימה.
 */
test('✨ התקנה חדשה לא מקבלת "מה חדש"', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await expect(page.getByRole('heading', { name: /מה חדש במשחק/ })).toHaveCount(0);
});

test('✨ מי שראה גרסה קודמת כן מקבל את הרשימה, פעם אחת', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();

  /**
   * מדמים משתמש ותיק: גרסה ישנה שנשמרה, ומשחק אחד ששוחק. שני
   * התנאים נדרשים — רשימת שינויים למי שעוד לא שיחק היא רעש.
   */
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((res, rej) => {
      const r = indexedDB.open('eretz-ir-go');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    await new Promise<void>((res) => {
      const tx = db.transaction(['settings', 'profiles'], 'readwrite');
      tx.objectStore('settings').put({ key: 'whatsNewSeen', value: '0000.00' });
      const store = tx.objectStore('profiles');
      const all = store.getAll();
      all.onsuccess = () => {
        const p = all.result[0];
        if (p) store.put({ ...p, gamesPlayed: 3 });
      };
      tx.oncomplete = () => res();
    });
  });

  /**
   * לשונית חדשה ולא `reload()`.
   *
   * ה-`addInitScript` של הבדיקה מוחק את מסד הנתונים **בכל טעינת
   * דף**, כולל רענון — כלומר רענון היה מוחק בדיוק את המצב שהבדיקה
   * הרגע הכינה. לשונית חדשה באותו הקשר חולקת את אותו IndexedDB
   * ואינה נושאת את הסקריפט.
   */
  const second = await page.context().newPage();
  await second.goto(page.url());
  await second.getByRole('button', { name: /בואו נשחק/ }).click();
  await expect(second.getByRole('heading', { name: /מה חדש במשחק/ })).toBeVisible();
  await second.getByRole('button', { name: /מגניב/ }).click();

  // ולא שוב באותה גרסה
  const third = await page.context().newPage();
  await third.goto(page.url());
  await third.getByRole('button', { name: /בואו נשחק/ }).click();
  await expect(third.getByRole('button', { name: /משחק חדש/ })).toBeVisible();
  await expect(third.getByRole('heading', { name: /מה חדש במשחק/ })).toHaveCount(0);
});
