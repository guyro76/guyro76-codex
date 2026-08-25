import { test, expect, type Page } from '@playwright/test';
import { stubExternalSources } from './helpers';

/**
 * סריקה רוחבית: נכנסים לכל מסך שאפשר להגיע אליו מהתפריט, ובודקים
 * שלושה דברים בכל אחד — שהוא נפתח, שהוא לא כותב שגיאה לקונסול,
 * ושכל כפתור בו הוא בעל שם נגיש ובגודל מגע סביר.
 *
 * הבדיקות הנקודתיות מכסות מסלולי משחק; זו נועדה לתפוס דווקא את מה
 * שנשבר במסך צדדי שאף אחד לא נכנס אליו בזמן פיתוח.
 */
/**
 * 44px — הרף של אפל ל-Touch Target, ורצפת .btn-small אצלנו. הכפתורים
 * הרגילים גדולים יותר (48). WCAG AA מסתפק ב-24, אבל זו אפליקציה
 * לילדים ולכן הרף כאן מחמיר יותר מהתקן.
 */
const MIN_TOUCH_TARGET = 44;

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    // כשל רשת לוויקיפדיה נחסם בכוונה בבדיקות ואינו באג של המשחק
    if (/he\.wikipedia\.org|net::ERR|Failed to load resource/.test(msg.text())) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(String(err)));
  return errors;
}

/**
 * ממתין לסיום כל האנימציות בדף.
 *
 * בלי זה המדידה תופסת כפתור באמצע אנימציית הכניסה, כשהוא עדיין
 * מוקטן — ומדווחת על גודל מגע שגוי שאינו קיים במצב הסופי.
 */
async function settleAnimations(page: Page): Promise<void> {
  await page.evaluate(() =>
    Promise.all(
      document.getAnimations().map((a) => a.finished.catch(() => undefined))
    ).then(() => undefined)
  );
}

/** כל כפתור נראה צריך שם שאפשר להקריא, ואזור לחיצה שילד יפגע בו */
async function auditButtons(page: Page, screen: string): Promise<string[] > {
  await settleAnimations(page);
  const problems: string[] = [];
  const buttons = page.locator('button:visible');
  const count = await buttons.count();
  expect(count, `במסך ${screen} אין אף כפתור`).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const btn = buttons.nth(i);
    const name = ((await btn.getAttribute('aria-label')) ?? (await btn.innerText())).trim();
    if (!name) {
      problems.push(`${screen}: כפתור ${i} בלי שם נגיש`);
      continue;
    }
    // הדפדפן מדווח גבהים שבריים (43.99 עבור כפתור שהוגדר 44), ולכן
    // מותרת סטייה של פחות מפיקסל אחד לפני שמכריזים על בעיה
    const box = await btn.boundingBox();
    if (box && box.height < MIN_TOUCH_TARGET - 1) {
      problems.push(`${screen}: "${name}" גובהו ${box.height.toFixed(1)}px`);
    }
  }
  return problems;
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await stubExternalSources(page);
});

test('🧭 כל מסכי התפריט נפתחים, בלי שגיאות ובלי כפתור בעייתי', async ({ page }) => {
  const errors = watchErrors(page);
  const problems: string[] = [];

  await page.goto('./');
  problems.push(...(await auditButtons(page, 'פתיחה')));

  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  problems.push(...(await auditButtons(page, 'פרופילים')));

  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();
  problems.push(...(await auditButtons(page, 'בית')));

  const screens: [RegExp, RegExp, string][] = [
    [/אוסף המילים שלי/, /אוסף המילים שלי/, 'אלבום'],
    [/הישגים/, /ההישגים שלי/, 'הישגים'],
    [/האתגר היומי/, /האתגר היומי/, 'אתגר יומי'],
    [/לוח השיאים/, /לוח השיאים המשפחתי/, 'לוח שיאים'],
    [/הגדרות/, /הגדרות/, 'הגדרות'],
    [/מקורות|קרדיט/, /מקורות|קרדיט/, 'קרדיטים'],
    [/פרטיות/, /פרטיות/, 'פרטיות']
  ];

  for (const [button, heading, label] of screens) {
    const trigger = page.getByRole('button', { name: button }).first();
    if (!(await trigger.isVisible().catch(() => false))) continue;
    await trigger.click();
    await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible({ timeout: 10_000 });
    problems.push(...(await auditButtons(page, label)));
    await page.getByRole('button', { name: /חזרה|←/ }).first().click();
    await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();
  }

  expect(problems, `בעיות נגישות: ${problems.join(' | ')}`).toEqual([]);
  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});

test('🧭 כל מצבי המשחק נבחרים ומגיעים למסך הקטגוריות', async ({ page }) => {
  const errors = watchErrors(page);

  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();

  const modes = [/משחק יחיד/, /ראש בראש/, /שרשרת/, /קלף מסתורי/];
  for (const mode of modes) {
    await page.getByRole('button', { name: /משחק חדש/ }).click();
    const button = page.getByRole('button', { name: mode }).first();
    if (!(await button.isVisible().catch(() => false))) continue;
    await button.click();

    // לחיצה על מצב מתקדמת מיד. לכל מצב יש מסך יעד אחר, ולכן נבדק
    // מה שנכון לכולם: שיצאנו ממסך בחירת המצב. זה בדיוק מה שנשבר
    // כשהקלף רק סימן את עצמו ולא הוביל לשום מקום.
    await expect(page.getByRole('heading', { name: 'איך משחקים היום?' })).toHaveCount(0, {
      timeout: 10_000
    });

    // חוזרים דרך כפתור הבית שבכותרת. מסכי הבליץ והשרשרת נכנסים ישר
    // למשחק ואין בהם "חזרה" — וזו בדיוק הסיבה שהכפתור הזה קיים בכל
    // מסך. הבדיקה כאן מאמתת גם אותו.
    await page.getByRole('button', { name: 'לדף הבית' }).click();
    await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible({ timeout: 10_000 });
  }

  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});

test('🌐 גם כשוויקיפדיה לא עונה בכלל — הסיבוב נסגר ומגיע למסך תוצאות', async ({ page }) => {
  const errors = watchErrors(page);

  // רשת שבולעת בקשות: לא מחזירה כלום ולא נכשלת. זה המצב שהקפיא את
  // המשחק לפני שהוגדרה תקרת זמן לבקשות.
  await page.route('**he.wikipedia.org/**', async () => {
    await new Promise((resolve) => setTimeout(resolve, 60_000));
  });

  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  // לחיצה על מצב מתקדמת ישירות למסך הקטגוריות
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();

  // קוראים את האות בזמן שגלגל ההגרלה עדיין על המסך
  await expect(page.getByRole('button', { name: /מתחילים/ })).toBeVisible({ timeout: 20_000 });
  const letter = (await page.locator('.letter-wheel .inner').innerText()).trim().charAt(0);
  await page.getByRole('button', { name: /מתחילים/ }).click();

  // מילה שלא במאגר — בדיוק המקרה ששולח בקשת אימות לוויקיפדיה
  await page.locator('.cat-card').first().getByRole('textbox').fill(`${letter}בגדזזז`);
  await page.getByRole('button', { name: /סיימתי/ }).click();

  // בלי תקרת הזמן המסך הזה פשוט לא היה מגיע
  await expect(page.getByRole('heading', { name: /תוצאות הסיבוב/ })).toBeVisible({ timeout: 40_000 });
  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});
