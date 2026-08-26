import { test, expect, type Page } from '@playwright/test';
import { stubExternalSources } from './helpers';

/**
 * התאמה למכשיר. הבדיקה נולדה מדרישה מפורשת: "שתמיד יוצג תקין ולא חתוך".
 *
 * שני דברים נבדקים בכל גודל מסך:
 * 1. **אין גלילה אופקית.** רוחב התוכן לא חורג מרוחב החלון — זה
 *    הסימן היחיד האמין ל"משהו נחתך", והוא תופס גם אלמנטים שדוחפים
 *    את הדף מהצד בלי שרואים אותם.
 * 2. **שום אלמנט אינו חורג מעבר לקצה.** נבדק לכל אלמנט נראה, כדי
 *    לתפוס כפתור או כרטיס שיצא מהמסך דווקא במכשיר צר.
 */
const SIZES = [
  { name: 'טלפון קטן', width: 320, height: 568 },
  { name: 'אייפון', width: 390, height: 844 },
  { name: 'טאבלט', width: 768, height: 1024 },
  { name: 'מחשב נייד', width: 1440, height: 900 }
];

async function overflow(page: Page): Promise<{ horizontal: boolean; offenders: string[] }> {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const w = doc.clientWidth;
    const offenders: string[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('body *'))) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      // סטייה של פיקסל אחד מותרת — עיגול תת-פיקסלי אינו חיתוך
      if (r.right > w + 1 || r.left < -1) {
        offenders.push(`${el.tagName.toLowerCase()}.${el.className || '—'} [${Math.round(r.left)}..${Math.round(r.right)}] של ${w}`);
      }
    }
    return { horizontal: doc.scrollWidth > w + 1, offenders: offenders.slice(0, 5) };
  });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await stubExternalSources(page);
});

for (const size of SIZES) {
  test(`📐 ${size.name} (${size.width}px) — שום מסך לא נחתך`, async ({ page }) => {
    await page.setViewportSize({ width: size.width, height: size.height });
    const problems: string[] = [];

    const check = async (label: string) => {
      const { horizontal, offenders } = await overflow(page);
      if (horizontal) problems.push(`${label}: גלילה אופקית`);
      if (offenders.length) problems.push(`${label}: חורג — ${offenders.join(' | ')}`);
    };

    await page.goto('./');
    await check('פתיחה');

    await page.getByRole('button', { name: /בואו נשחק/ }).click();
    await check('פרופילים');

    await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();
    await check('בית');

    for (const [btn, heading, label] of [
      [/אוסף המילים שלי/, /אוסף המילים שלי/, 'אלבום'],
      [/הישגים/, /ההישגים שלי/, 'הישגים'],
      [/לוח השיאים/, /לוח השיאים המשפחתי/, 'שיאים'],
      [/הגדרות/, /הגדרות/, 'הגדרות']
    ] as [RegExp, RegExp, string][]) {
      const trigger = page.getByRole('button', { name: btn }).first();
      if (!(await trigger.isVisible().catch(() => false))) continue;
      await trigger.click();
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible({ timeout: 10_000 });
      await check(label);
      await page.getByRole('button', { name: /חזרה|←/ }).first().click();
      await expect(page.getByRole('button', { name: /משחק חדש/ })).toBeVisible();
    }

    // מסך המשחק עצמו — הצפוף ביותר, ולכן הכי חשוף לחיתוך
    await page.getByRole('button', { name: /משחק חדש/ }).click();
    await check('בחירת מצב');
    // לחיצה על מצב מתקדמת ישירות לקטגוריות
    await page.getByRole('button', { name: /משחק יחיד/ }).click();
    await check('קטגוריות');
    await page.getByRole('button', { name: /להגרלת האות/ }).click();
    await page.locator('.letter-wheel').click();
    await expect(page.getByRole('button', { name: /מתחילים/ })).toBeVisible({ timeout: 15_000 });
    await check('הגרלת אות');
    await page.getByRole('button', { name: /מתחילים/ }).click();
    await expect(page.locator('.cat-card').first()).toBeVisible();
    await check('משחק');

    expect(problems, `בעיות תצוגה ב-${size.name}:\n${problems.join('\n')}`).toEqual([]);
  });
}


/**
 * טקסט שנשבר אות אחת בשורה.
 *
 * זה לא "חיתוך", ולכן הבדיקות שלמעלה לא תפסו את זה: שום דבר לא חרג
 * מהמסך ולא נוצרה גלילה אופקית. פשוט שם הקטגוריה הופיע במאונך —
 * א' מעל ר' מעל ץ' — כי שני הכפתורים שלצידו לקחו את כל הרוחב
 * ו-`overflow-wrap: anywhere` עשה את שלו.
 *
 * זה התגלה בצילומי המסך לחנות, שהם הפעם הראשונה שהמשחק צולם ברוחב
 * טלפון אמיתי במקום חלון דפדפן רחב. הבדיקה כאן מוודאת שזה לא יחזור.
 */
test('📏 שמות הקטגוריות נשארים בשורה אחת גם בטלפון צר', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });

  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });
  await expect(page.locator('.cat-card').first()).toBeVisible();

  const broken = await page.evaluate(() => {
    const bad: string[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('.cat-name'))) {
      const line = parseFloat(getComputedStyle(el).lineHeight) || 20;
      const lines = el.getBoundingClientRect().height / line;
      // שתי שורות זה עדיין קריא; שלוש ומעלה זה טקסט שנשבר לאותיות
      if (lines > 2.2) bad.push(`"${el.textContent?.trim()}" נפרס על ${lines.toFixed(1)} שורות`);
    }
    return bad;
  });

  expect(broken, `שם קטגוריה נשבר לאותיות: ${broken.join(' | ')}`).toEqual([]);
});


/**
 * מסך חדש מתחיל מלמעלה.
 *
 * המשחק מחליף מסכים בתוך אותו דף, והדפדפן שומר את מיקום הגלילה.
 * ילד שגלל למטה כדי למלא את הקטגוריה האחרונה ולחץ "סיימתי" נחת
 * במסך התוצאות באמצע — מעל הניקוד שלו ומעל הכותרת. זה נמדד בפועל
 * (388 פיקסלים) ולא שוער.
 *
 * הבדיקה גוללת בכוונה לתחתית לפני כל מעבר, כי בלי גלילה אין מה
 * לאפס ובדיקה כזו עוברת מעצמה.
 */
test('🔝 כל מעבר מסך מתחיל מלמעלה, גם אחרי גלילה', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  const scrollY = () => page.evaluate(() => window.scrollY);
  const toBottom = () => page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();

  // מסך הקטגוריות ארוך — גוללים לתחתית ומתקדמים משם
  await toBottom();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await expect(page.locator('.letter-wheel')).toBeVisible();
  /**
   * `expect.poll` ולא בדיקה מיידית: האיפוס קורה ב-effect של React,
   * כלומר אחרי ה-commit. מדידה ברגע הלחיצה תופסת עדיין את המסך
   * הקודם — וזה בדיוק מה שהפיל את הבדיקה הזו בכתיבתה.
   */
  await expect.poll(scrollY, { message: 'מסך הגרלת האות נפתח גלול' }).toBe(0);

  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });
  await expect(page.locator('.cat-card').first()).toBeVisible();

  // ממלאים תשובה אחת, גוללים לתחתית כמו ילד שסיים את האחרונה
  const card = page.locator('.cat-card').first();
  await card.getByRole('button', { name: /רמז/ }).click();
  await card.getByRole('button', { name: /עוד רמז/ }).click();
  await card.getByRole('button', { name: /גלו לי/ }).click();
  await toBottom();
  expect(await scrollY(), 'הבדיקה לא הצליחה לגלול — אין מה לאפס').toBeGreaterThan(0);

  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();
  await expect(page.getByRole('heading', { name: /תוצאות הסיבוב/ })).toBeVisible({ timeout: 25_000 });
  const closeNew = page.getByRole('button', { name: /מעולה|למילה הבאה/ });
  while (await closeNew.first().isVisible().catch(() => false)) {
    await closeNew.first().click();
    await page.waitForTimeout(200);
  }
  await expect.poll(scrollY, { message: 'מסך תוצאות הסיבוב נפתח גלול, מעל הניקוד' }).toBe(0);

  await toBottom();
  await page.getByRole('button', { name: /לתוצאות המשחק/ }).click();
  await expect(page.getByRole('heading', { name: 'סוף המשחק!' })).toBeVisible();
  await expect.poll(scrollY, { message: 'מסך סוף המשחק נפתח גלול' }).toBe(0);
});
