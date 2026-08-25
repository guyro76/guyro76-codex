import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';
import { stubExternalSources } from './helpers';
import { FREE_BASE_URL } from '../playwright.config';

/**
 * נגישות אוטומטית — axe-core על המסכים האמיתיים.
 *
 * עד כה הנגישות נבדקה בשתי דרכים ידניות: `tests/contrast.test.ts`
 * מחשב ניגודיות מתוך ה-CSS, ו-`sweep.spec.ts` מודד גובה כפתורים.
 * שתיהן טובות ושתיהן צרות — הן בודקות מה שמישהו חשב לבדוק. axe
 * בודק את מה שאיש לא חשב עליו: שדה בלי תווית, כפתור בלי שם נגיש,
 * מבנה כותרות שבור, `aria` שמצביע לשומקום, מזהה כפול.
 *
 * הבדיקה חוסמת רק על תקני WCAG 2 A/AA. axe מדווח גם על "שיטות
 * מומלצות" שאינן תקן, והן אינן עילה להפיל בנייה.
 *
 * למה זה חשוב דווקא לפני חנות: Google Play בודקת נגישות בסקירה,
 * ואפליקציה לילדים שנכשלת בה נדחית. חשוב מזה — ילד שמשתמש בקורא
 * מסך צריך לשחק, וזה לא ייבדק אלא אם בודקים.
 */

/** התקנים שנאכפים. שאר הכללים של axe הם המלצות ולא דרישות. */
const STANDARD = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * ניגודיות **אינה** נבדקת כאן, למרות שהיא כלל הברזל של הפרויקט:
 * axe מודד פיקסלים בפועל ולכן הוא נופל על טקסט מעל תמונה או מעל
 * שכבת זכוכית, גם כשהצבעים תקינים. הבדיקה האמיתית לניגודיות היא
 * `tests/contrast.test.ts`, שמחשב אותה מתוך הטוקנים בכל שש הערכות.
 */
const SKIP = ['color-contrast'];

async function scan(page: Page, screen: string): Promise<void> {
  const res = await new AxeBuilder({ page }).withTags(STANDARD).disableRules(SKIP).analyze();
  /**
   * ההשוואה היא על מחרוזת ולא על מערך התוצאות: axe מחזיר אובייקט
   * ענק לכל הפרה, ודוח כישלון שמדפיס אותו במלואו מסתיר את השורה
   * האחת שאומרת מה לתקן.
   */
  const summary = res.violations
    .map((v) => `[${v.impact}] ${v.id}: ${v.help}\n   ${v.nodes.map((n) => n.target.join(' ')).join('\n   ')}`)
    .join('\n');
  expect(summary, `הפרות נגישות במסך ${screen}`).toBe('');
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await stubExternalSources(page);
});

/**
 * אותה רשימת מסכים כמו ב-`sweep.spec.ts` — כל מה שאפשר להגיע אליו
 * מהתפריט. מסך שלא נבדק הוא מסך שאיש לא יידע שהוא לא נגיש.
 */
const MENU_SCREENS: [RegExp, RegExp, string][] = [
  [/אוסף המילים שלי/, /אוסף המילים שלי/, 'אלבום'],
  [/הישגים/, /ההישגים שלי/, 'הישגים'],
  [/האתגר היומי/, /האתגר היומי/, 'אתגר יומי'],
  [/לוח השיאים/, /לוח השיאים המשפחתי/, 'לוח שיאים'],
  [/הגדרות/, /הגדרות/, 'הגדרות'],
  [/מקורות|קרדיט/, /מקורות|קרדיט/, 'קרדיטים'],
  [/פרטיות/, /פרטיות/, 'פרטיות']
];

test('♿ כל מסכי התפריט עוברים את axe בתקן WCAG AA', async ({ page }) => {
  await page.goto('./');
  await scan(page, 'פתיחה');

  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();
  await scan(page, 'בית');

  const visited: string[] = [];
  for (const [button, heading, label] of MENU_SCREENS) {
    const trigger = page.getByRole('button', { name: button }).first();
    if (!(await trigger.isVisible().catch(() => false))) continue;
    await trigger.click();
    await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible({ timeout: 10_000 });
    await scan(page, label);
    visited.push(label);
    await page.getByRole('button', { name: /חזרה|←/ }).first().click();
    await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();
  }

  /**
   * בדיקה שדילגה בשקט על כל המסכים עוברת ואינה בודקת כלום. זו
   * ההגנה מפני מצב שבו שינוי בשם כפתור מרוקן את הסריקה בלי שאיש
   * ישים לב.
   */
  expect(visited.length, `נסרקו רק ${visited.join(', ')}`).toBeGreaterThanOrEqual(5);
});

test('♿ מסלול המשחק עצמו עובר את axe בתקן WCAG AA', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await scan(page, 'בחירת מצב');

  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await scan(page, 'קטגוריות');

  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await scan(page, 'גלגל האותיות');

  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });
  await expect(page.locator('.cat-card').first()).toBeVisible();
  await scan(page, 'לוח המשחק');

  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();
  await expect(page.getByRole('heading', { name: /תוצאות הסיבוב/ })).toBeVisible({ timeout: 25_000 });
  const closeNew = page.getByRole('button', { name: /מעולה|למילה הבאה/ });
  while (await closeNew.first().isVisible().catch(() => false)) {
    await closeNew.first().click();
    await page.waitForTimeout(200);
  }
  await scan(page, 'תוצאות הסיבוב');
});


/**
 * גודל אזור המגע, בשני צירים ולכל דבר שאפשר ללחוץ עליו.
 *
 * `sweep.spec.ts` מודד **גובה של כפתורים** במסכי התפריט. הבדיקה
 * כאן מרחיבה את זה למה שנשאר בחוץ: גם רוחב, וגם שדות, קישורים
 * ובוררים — ובמסכים שבהם באמת יושבים היעדים הקטנים.
 *
 * 44px הוא הרף של אפל, ורצפת `.btn-small` אצלנו. WCAG 2.2 מסתפק
 * ב-24, אבל זו אפליקציה שילד בן עשר משחק בה באצבע על טלפון.
 */
const MIN_TOUCH_TARGET = 44;

/** כל מה שאפשר ללחוץ או להקליד בו */
const INTERACTIVE = 'button:visible, a[href]:visible, select:visible, input:visible, [role="button"]:visible';

async function auditTouchTargets(page: Page, screen: string): Promise<string[]> {
  /**
   * ממתינים לסיום אנימציות הכניסה, אחרת נמדד כפתור באמצע הקטנה
   * ומדווח גודל מגע שאינו קיים במצב הסופי. **רק אנימציות סופיות**:
   * לגלגל הארץ במסך הכניסה יש `iterations: Infinity`, ו-`finished`
   * שלו לעולם לא מתממש — המתנה לו תלתה את הבדיקה עד timeout.
   */
  await page.evaluate(() => {
    const finite = document
      .getAnimations()
      .filter((a) => Number.isFinite(a.effect?.getTiming().iterations ?? 1));
    return Promise.race([
      Promise.all(finite.map((a) => a.finished.catch(() => undefined))),
      new Promise((done) => setTimeout(done, 1200))
    ]).then(() => undefined);
  });
  const problems: string[] = [];
  const items = page.locator(INTERACTIVE);
  for (let i = 0; i < (await items.count()); i++) {
    const el = items.nth(i);
    const box = await el.boundingBox();
    if (!box) continue;
    /**
     * קישור בתוך משפט פטור — וזה לא ויתור אלא לשון התקן עצמו:
     * WCAG 2.2 סעיף 2.5.8 מחריג במפורש "inline", כי קישור בתוך
     * פסקה אינו יכול להיות בגובה 44px בלי לשבור את שורות הטקסט.
     * הפטור מצומצם לקישור שהוא באמת inline **ויושב בתוך טקסט
     * נוסף** — קישור שעומד לבדו אינו חלק ממשפט וחייב להיות גדול.
     */
    const inlineInText = await el.evaluate((n) => {
      if (n.tagName !== 'A') return false;
      if (getComputedStyle(n).display !== 'inline') return false;
      const around = (n.parentElement?.textContent ?? '').replace(n.textContent ?? '', '').trim();
      return around.length > 0;
    });
    if (inlineInText) continue;

    /**
     * תיבת סימון שיושבת בתוך `<label>` — היעד האמיתי הוא התווית
     * כולה, כי לחיצה על הטקסט מסמנת אותה. מדידת ה-`input` לבדו
     * מדווחת 22px על יעד שהוא בפועל שורה שלמה.
     */
    const labelBox = await el.evaluate((n) => {
      const type = n.getAttribute('type');
      if (type !== 'checkbox' && type !== 'radio') return null;
      const label = n.closest('label');
      if (!label) return null;
      const r = label.getBoundingClientRect();
      return { width: r.width, height: r.height };
    });
    const effective = labelBox ?? box;
    // הדפדפן מדווח גדלים שבריים (43.99 לכפתור שהוגדר 44)
    const small = effective.height < MIN_TOUCH_TARGET - 1 || effective.width < MIN_TOUCH_TARGET - 1;
    if (!small) continue;
    const name =
      ((await el.getAttribute('aria-label')) ?? (await el.innerText()).trim()) ||
      (await el.evaluate((n) => `${n.tagName}[type=${n.getAttribute('type') ?? '-'}][class=${n.className || '-'}]`));
    problems.push(`${screen}: "${name}" ${effective.width.toFixed(0)}×${effective.height.toFixed(0)}px`);
  }
  return problems;
}

test('👆 אזורי המגע במסכי המשחק גדולים דיים לאצבע של ילד', async ({ page }) => {
  const problems: string[] = [];

  await page.goto('./');
  problems.push(...(await auditTouchTargets(page, 'פתיחה')));

  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();
  problems.push(...(await auditTouchTargets(page, 'בית')));

  await page.getByRole('button', { name: /משחק חדש/ }).click();
  problems.push(...(await auditTouchTargets(page, 'בחירת מצב')));

  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  problems.push(...(await auditTouchTargets(page, 'קטגוריות')));

  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });
  await expect(page.locator('.cat-card').first()).toBeVisible();
  problems.push(...(await auditTouchTargets(page, 'לוח המשחק')));

  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();
  await expect(page.getByRole('heading', { name: /תוצאות הסיבוב/ })).toBeVisible({ timeout: 25_000 });
  const closeNew = page.getByRole('button', { name: /מעולה|למילה הבאה/ });
  while (await closeNew.first().isVisible().catch(() => false)) {
    await closeNew.first().click();
    await page.waitForTimeout(200);
  }
  problems.push(...(await auditTouchTargets(page, 'תוצאות הסיבוב')));

  expect(problems, `יעדי מגע קטנים מדי: ${problems.join(' | ')}`).toEqual([]);
});


/**
 * מסך הכניסה קיים רק בבנייה שיש בה מערכת חשבונות (פורט 4174).
 * הוא הראשון שמשתמש חדש רואה אחרי התקנה מהחנות, ויש בו את השדות
 * היחידים במשחק שמקבלים הקלדה של מבוגר — מייל וסיסמה. שדה בלי
 * תווית שם הוא בדיוק סוג התקלה שסקירת החנות תופסת.
 */
test.describe('מסך הכניסה', () => {
  test.skip(Boolean(process.env.PW_BASE_URL), 'בנייה חיצונית — אין בניית חשבונות מקומית');
  test.use({ baseURL: FREE_BASE_URL });

  test('♿ מסך הכניסה עובר את axe ואזורי המגע בו תקינים', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('button').first()).toBeVisible({ timeout: 15_000 });
    await scan(page, 'כניסה');
    expect(await auditTouchTargets(page, 'כניסה')).toEqual([]);

    // מסלול המייל פותח את השדות עצמם — שם יושבת תיבת הסיסמה
    const withEmail = page.getByRole('button', { name: /מייל|אימייל|סיסמה/ }).first();
    if (await withEmail.isVisible().catch(() => false)) {
      await withEmail.click();
      await scan(page, 'כניסה עם מייל');
      expect(await auditTouchTargets(page, 'כניסה עם מייל')).toEqual([]);
    }
  });
});
