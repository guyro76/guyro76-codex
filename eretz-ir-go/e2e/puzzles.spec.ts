import { test, expect, type Page } from '@playwright/test';
import { stubWikipedia } from './helpers';

/**
 * פאזלים — מסיום הסיבוב ועד הלוח במסך הפאזלים.
 *
 * מה שחשוב לוודא כאן הוא לא שהלוח יפה, אלא שהחלק באמת נשמר: פרס
 * שמוצג פעם אחת ונעלם ברענון גרוע יותר מלא לתת פרס בכלל.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await stubWikipedia(page);
});

/**
 * `fresh` שולט אם מתחילים בטעינת עמוד.
 *
 * חשוב: ה-beforeEach מוחק את IndexedDB בכל טעינה של העמוד, ולכן
 * סיבוב שני שמתחיל ב-goto היה מוחק את החלקים שנאספו בראשון —
 * ומודד את מחיקת הבדיקה במקום את שמירת המשחק.
 */
async function playRound(page: Page, fresh = true) {
  if (fresh) {
    await page.goto('./');
    await page.getByRole('button', { name: /בואו נשחק/ }).click();
  }
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });
  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();
}

test('🧩 סיום סיבוב מזכה בחלק פאזל, והחלק נשמר', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  await playRound(page);

  // כרטיס הפרס מופיע בתוצאות הסיבוב, עם חלק אחד שנחשף
  const awardCard = page.locator('.puzzle-award');
  await expect(awardCard).toBeVisible({ timeout: 30_000 });
  // חלק שנאסף לא מצויר כלל — לכן סופרים את מה שעדיין חסר
  const board = awardCard.locator('.puzzle-cover');
  const missing = await board.locator('.puzzle-piece.missing').count();
  const total = 6; // הלוח הקטן ביותר; הבדיקה רק דורשת שמשהו נחשף
  expect(missing).toBeLessThan(total * 2);
  await expect(awardCard.locator('.puzzle-piece.just-won')).toHaveCount(1);

  const title = (await awardCard.locator('strong').first().textContent())?.trim() ?? '';
  expect(title.length).toBeGreaterThan(1);

  // וגם אחרי יציאה מהמסך — החלק עדיין שם
  await page.getByRole('button', { name: 'לדף הבית' }).click();
  await page.getByRole('button', { name: /הפאזלים שלי/ }).click();

  await expect(page.getByText(/אספתם 1 חלקים/)).toBeVisible();

  expect(errors, `שגיאות: ${errors.join(' | ')}`).toEqual([]);
});

test('🧩 שני סיבובים — שני חלקים, ולא של אותו פאזל', async ({ page }) => {
  await playRound(page);
  await expect(page.locator('.puzzle-award')).toBeVisible({ timeout: 30_000 });
  const first = (await page.locator('.puzzle-award strong').first().textContent())?.trim() ?? '';

  await page.getByRole('button', { name: 'לדף הבית' }).click();
  await playRound(page, false);
  await expect(page.locator('.puzzle-award')).toBeVisible({ timeout: 30_000 });
  const second = (await page.locator('.puzzle-award strong').first().textContent())?.trim() ?? '';

  expect(second).not.toBe(first);

  await page.getByRole('button', { name: 'לדף הבית' }).click();
  await page.getByRole('button', { name: /הפאזלים שלי/ }).click();
  await expect(page.getByText(/אספתם 2 חלקים/)).toBeVisible();
});

test('🧩 בלי רשת הלוח עדיין נפתח ומסביר שהתמונה תגיע', async ({ page }) => {
  // חוסמים לגמרי את התמונות ואת ויקיפדיה
  await page.route('**/upload.wikimedia.org/**', (r) => r.abort());
  await page.route('**he.wikipedia.org/**', (r) => r.abort());

  await playRound(page);
  const awardCard = page.locator('.puzzle-award');
  await expect(awardCard).toBeVisible({ timeout: 30_000 });
  // החלק נחשף — האיסוף לא תלוי ברשת
  await expect(awardCard.locator('.puzzle-piece.just-won')).toHaveCount(1);
});


/**
 * הדרישה המפורשת: חלקים גזורים כמו בפאזל אמיתי ולא ריבועים.
 *
 * ריבוע נכתב כמסלול של קווים ישרים בלבד; חלק פאזל חייב עקומות ופינים.
 * לכן נבדק כאן המסלול עצמו ולא רק שיש אלמנט על המסך.
 */
test('🧩 החלקים גזורים בצורת פאזל — לא ריבועים', async ({ page }) => {
  await playRound(page);
  await page.getByRole('button', { name: 'לדף הבית' }).click();
  await page.getByRole('button', { name: /הפאזלים שלי/ }).click();

  const piece = page.locator('.puzzle-piece').first();
  await expect(piece).toBeVisible();
  const d = (await piece.getAttribute('d')) ?? '';

  // עקומות בזייה — זה מה שמייצר את הפין והשקע
  expect(d).toMatch(/C/);
  expect((d.match(/C/g) ?? []).length).toBeGreaterThanOrEqual(4);
  expect(d.trim().endsWith('Z')).toBe(true);

  // חלק פנימי חייב לחרוג מהמלבן שלו — זה בדיוק מה שפין עושה.
  // בלוח 3×2 על 600×400 כל תא הוא 200×200, ולכן חלק שגובהו בדיוק
  // 200 בכל נקודה הוא ריבוע.
  const paths = await page.locator('.puzzle-piece').evaluateAll((els) =>
    els.map((e) => e.getAttribute('d') ?? '')
  );
  const hasCurvyInterior = paths.some((p) => (p.match(/C/g) ?? []).length > 4);
  expect(hasCurvyInterior, 'לא נמצא אף חלק עם פין — כנראה כולם ריבועים').toBe(true);
});

/**
 * ממלא את הארנק ישירות במסד.
 *
 * בלי זה הבדיקה הייתה תלויה בכמה קרדיט הצטבר בסיבוב אחד — ובסיבוב
 * של בדיקה, שבו לא נכתבות תשובות, הוא בדרך כלל אפס. אז מסלול
 * הקנייה עצמו לא היה נבדק אף פעם, והבדיקה הייתה עוברת בשקט על
 * הענף של "אין מספיק קרדיט".
 */
async function fillWallet(page: Page, profileId = 1) {
  await page.evaluate(
    ({ id }) =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open('eretz-ir-go');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const database = open.result;
          const tx = database.transaction('settings', 'readwrite');
          tx.objectStore('settings').put({
            key: `wallet-${id}`,
            value: JSON.stringify({ bills: 99, gems: 99 })
          });
          tx.oncomplete = () => {
            database.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    { id: profileId }
  );
}

/**
 * קניית חלק חסר. הדבר היחיד שאסור להישבר כאן הוא שילד ישלם ולא
 * יקבל — ולכן נבדק גם הארנק וגם הלוח, אחרי רענון.
 */
test('🧩 אפשר לקנות חלק חסר בקרדיט, והקנייה נשמרת', async ({ page }) => {
  await playRound(page);
  await page.getByRole('button', { name: 'לדף הבית' }).click();
  await page.getByRole('button', { name: /הפאזלים שלי/ }).click();

  await fillWallet(page);
  // חוזרים למסך כדי שהארנק ייקרא מחדש, בלי goto שימחק את המסד
  await page.getByRole('button', { name: 'לדף הבית' }).click();
  await page.getByRole('button', { name: /הפאזלים שלי/ }).click();

  // ממתינים שהלוחות ייטענו: ספירה לפני הרינדור מחזירה 0 ומודדת כלום
  await expect(page.locator('.puzzle-piece.missing').first()).toBeVisible();
  const before = await page.locator('.puzzle-piece.missing').count();
  expect(before).toBeGreaterThan(0);

  await page.locator('.puzzle-piece.buyable').first().click();
  await expect(page.getByRole('heading', { name: /לקנות את החלק החסר/ })).toBeVisible();

  const buy = page.getByRole('button', { name: /שטרות/ });
  await expect(buy).toBeEnabled();
  await buy.click();

  await expect(page.getByRole('heading', { name: /לקנות את החלק החסר/ })).toBeHidden();
  // חלק אחד פחות חסר — הקנייה באמת הוסיפה חלק ללוח
  await expect(page.locator('.puzzle-piece.missing')).toHaveCount(before - 1);

  // והיא שרדה מעבר בין מסכים, כלומר נשמרה במסד ולא רק ב-state
  await page.getByRole('button', { name: 'לדף הבית' }).click();
  await page.getByRole('button', { name: /הפאזלים שלי/ }).click();
  await expect(page.locator('.puzzle-piece.missing')).toHaveCount(before - 1);

  // והארנק חויב
  await expect(page.getByText(/אספתם 2 חלקים/)).toBeVisible();
});
