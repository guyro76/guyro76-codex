import { test, expect, type Page } from '@playwright/test';
import { stubWikipedia } from './helpers';
import { SEED_ENTRIES } from '../src/data/seed';

/**
 * פודיום הזוכים בסוף דו-קרב.
 *
 * שתי דרישות נבדקות כאן, ושתיהן נאמרו במפורש: **בחדר רואים את השמות
 * של מי שמשחק איתך**, והמקומות מוצגים כפודיום לפי דירוג ולא כרשימה.
 */
/**
 * בלי מחיקת IndexedDB ב-addInitScript, בכוונה.
 *
 * הסקריפט הזה רץ בכל ניווט, ולכן ה-reload שאחרי זריעת השחקן השני היה
 * מוחק אותו — והבדיקה הייתה נכשלת על "אין יריב" במקום למדוד את
 * הפודיום. הקשר דפדפן חדש ממילא מתחיל עם מסד ריק.
 */
test.beforeEach(async ({ page }) => {
  await stubWikipedia(page);
});

/**
 * מוסיף שחקן שני למכשיר — דו-קרב דורש שניים.
 *
 * ממתין קודם שהאפליקציה תיצור את המסד בפועל. בלי ההמתנה הזריעה
 * מתחרה בהפעלה: לפעמים היא רצה על מסד שעדיין אין בו את טבלת
 * הפרופילים, השחקן לא נשמר, והמסך מציג "אין עוד שחקנים" — כשל
 * שנראה כמו באג במשחק אבל הוא באג בבדיקה.
 */
async function addSecondPlayer(page: Page, name = 'מאיה') {
  await page.waitForFunction(
    () =>
      new Promise<boolean>((resolve) => {
        const open = indexedDB.open('eretz-ir-go');
        open.onerror = () => resolve(false);
        open.onsuccess = () => {
          const database = open.result;
          const ready = database.objectStoreNames.contains('profiles');
          database.close();
          resolve(ready);
        };
      }),
    undefined,
    { timeout: 15_000 }
  );

  await page.evaluate(
    (playerName) =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open('eretz-ir-go');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const database = open.result;
          const tx = database.transaction('profiles', 'readwrite');
          tx.objectStore('profiles').put({
            name: playerName,
            avatar: '🐬',
            color: '#ff5c9d',
            gender: 'other',
            age: 10,
            difficulty: 'medium',
            soundOn: true,
            reducedMotion: false,
            favoriteCategories: [],
            totalScore: 0,
            wins: 0,
            gamesPlayed: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            originalitySum: 0,
            bestRoundScore: 0,
            dailyStreak: 0,
            lastDailyDate: '',
            achievements: [],
            createdAt: new Date().toISOString()
          });
          tx.oncomplete = () => {
            database.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    name
  );
}

test('🏆 סוף דו-קרב מציג פודיום עם השמות של שני השחקנים', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto('./');
  // ממתינים שהאפליקציה תפתח את המסד לפני הזריעה. בלי זה הזריעה רצה
  // על מסד שעוד לא נוצר, ואז אין שחקן שני והמסך מציג "אין עוד שחקנים".
  await expect(page.getByRole('button', { name: /בואו נשחק/ })).toBeVisible();
  await addSecondPlayer(page);
  await page.reload();

  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /דו-קרב/ }).click();

  // בחירת היריב — דו-קרב לא מתחיל בלעדיו
  const opponent = page.getByRole('button', { name: 'מאיה' });
  await expect(opponent).toBeVisible({ timeout: 15_000 });
  await opponent.click();
  // דו-קרב לא מתקדם בלחיצה על המצב כמו משחק יחיד — צריך לאשר במפורש
  await page.getByRole('button', { name: /המשך לבחירת קטגוריות/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });

  /**
   * השחקן הראשון עונה תשובה אמיתית כדי שתהיה הכרעה.
   *
   * בלי זה שני השחקנים מסיימים על 0, המשחק מוכרז תיקו — ואז אין
   * פודיום כלל, בצדק. המילה נבחרת מתוך מאגר ה-seed של המשחק עצמו
   * לפי האות שהוגרלה, ולכן היא תמיד תקפה ואין כאן ניחוש.
   */
  const letter = (
    await page
      .locator('.round-letter')
      .first()
      .innerText({ timeout: 5_000 })
      .catch(() => '')
  )
    .trim()
    .slice(0, 1);
  expect(letter, 'לא נקראה האות שהוגרלה — בלי זה אי אפשר לענות תשובה תקפה').toMatch(/[א-ת]/);

  // שני התורות. לפני כל תור יש מסך מסירת מכשיר ("מאיה, מתחילים?"),
  // חוץ מהתור הראשון שכבר התחיל למעלה.
  for (let turn = 0; turn < 2; turn++) {
    const start = page.getByRole('button', { name: /מתחילים/ });
    if (await start.count()) await start.first().click();

    // רק הראשון עונה — כך נוצר פער ניקוד ולא תיקו
    if (turn === 0 && letter) {
      const word = SEED_ENTRIES.find((x) => x.c.includes('country') && x.n.startsWith(letter))?.n;
      const box = page.getByRole('textbox').first();
      if (word && (await box.count())) await box.fill(word);
    }

    const done = page.getByRole('button', { name: /סיימתי|סיום/ }).first();
    await expect(done).toBeVisible({ timeout: 20_000 });
    await done.click();
    await page.waitForTimeout(800);
  }

  const toMatch = page.getByRole('button', { name: /לתוצאות המשחק/ });
  await expect(toMatch).toBeVisible({ timeout: 30_000 });
  await toMatch.click();

  // הפודיום עצמו. אם המשחק הסתיים בתיקו אין דירוג, וזו התנהגות
  // נכונה — אז מוודאים שאכן מוצג תיקו ולא פודיום שקרי.
  const podium = page.locator('.podium');
  if (await page.getByText('תיקו!').count()) {
    await expect(podium).toHaveCount(0);
    await expect(page.getByText('שניכם אלופים')).toBeVisible();
    return;
  }
  await expect(podium).toBeVisible();
  await expect(podium.locator('.podium-slot')).toHaveCount(2);

  // בחדר רואים את השמות — זו כל הנקודה
  await expect(podium.getByText('אורי')).toBeVisible();
  await expect(podium.getByText('מאיה')).toBeVisible();

  // מקום ראשון גבוה מהשני, אחרת זו רשימה ולא פודיום
  const first = await podium.locator('.place-1 .podium-step').boundingBox();
  const second = await podium.locator('.place-2 .podium-step').boundingBox();
  expect(first!.height).toBeGreaterThan(second!.height);

  // אנימציית הכניסה של המסך עדיין רצה בשנייה הראשונה; בלי ההמתנה
  // הצילום יוצא מעומעם ולא מייצג את מה שילד רואה
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'test-results/podium.png' });
  expect(errors, `שגיאות: ${errors.join(' | ')}`).toEqual([]);
});
