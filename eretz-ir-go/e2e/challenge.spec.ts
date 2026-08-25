import { test, expect, type Page } from '@playwright/test';
import { stubExternalSources } from './helpers';
import { SEED_ENTRIES } from '../src/data/seed';
import { QUICK_PHRASES } from '../src/lib/quickChat';

/**
 * אתגר לחבר — המסלול המלא, משני הצדדים.
 *
 * זו הבדיקה שמוכיחה שהפיצ'ר עובד באמת: שחקן אחד מסיים סיבוב ושולח
 * קישור, ואז אותו קישור נפתח כאילו הוא הגיע בוואטסאפ — ומגיע עד
 * מסך ההשוואה. בדיקת יחידה על הקידוד לא הייתה תופסת שום שבר
 * בשרשרת שבין המסכים.
 */
test.beforeEach(async ({ page }) => {
  // הבדיקה עוברת דרך about:blank כדי לאלץ טעינה אמיתית, ושם הגישה
  // ל-IndexedDB חסומה. בלי ה-try הניקוי היה מייצר שגיאת דף משלו
  // ומפיל את הבדיקה על רעש שהיא עצמה יצרה.
  await page.addInitScript(() => {
    try {
      indexedDB.deleteDatabase('eretz-ir-go');
    } catch {
      /* origin בלי אחסון — אין מה לנקות */
    }
  });
  await stubExternalSources(page);
});

/** מחליף את Web Share בלוכד, כדי לראות בדיוק מה נשלח */
async function captureShares(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { __shared: string[] }).__shared = [];
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: (data: { text: string }) => {
        (window as unknown as { __shared: string[] }).__shared.push(data.text);
        return Promise.resolve();
      }
    });
  });
}

const shared = (page: Page) => page.evaluate(() => (window as unknown as { __shared: string[] }).__shared);

/**
 * סיבוב יחיד קצר, עד מסך סוף המשחק.
 *
 * `answer` שולט אם עונים בפועל. השולח **חייב** לצבור נקודות: אתגר
 * של אפס מול אפס הוא תיקו, וההשוואה בסוף הייתה עוברת בלי להוכיח
 * שהניקוד באמת נסע בקישור.
 */
async function playOneRound(page: Page, answer: boolean): Promise<void> {
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });
  if (answer) await fillOneAnswer(page);
  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();
  await page.getByRole('button', { name: /הבא|סיום|לתוצאות/ }).first().click();
}

/** ממלא תשובה תקפה אחת, לפי האות שהוגרלה בפועל */
async function fillOneAnswer(page: Page): Promise<void> {
  const letter = (await page.locator('.round-letter').first().innerText({ timeout: 10_000 })).trim().slice(0, 1);
  expect(letter, 'לא נקראה האות שהוגרלה — בלי זה אי אפשר לענות תשובה תקפה').toMatch(/[א-ת]/);

  // המילה נבחרת ממאגר ה-seed של המשחק עצמו לפי האות שהוגרלה, ולכן
  // היא תמיד תקפה — אין כאן ניחוש שעלול להיפסל
  const word = SEED_ENTRIES.find((x) => x.c.includes('country') && x.n.startsWith(letter))?.n;
  expect(word, `אין מילת seed לאות ${letter}`).toBeTruthy();
  await page.getByRole('textbox').first().fill(word!);
}

test('🎯 אתגר נשלח, נפתח מקישור, ומגיע עד ההשוואה', async ({ page, baseURL }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  await captureShares(page);
  await page.goto('./');
  await playOneRound(page, true);

  // ===== צד השולח =====
  await page.getByRole('button', { name: /לשלוח אתגר/ }).click();
  await expect(page.getByText(/נשלח!/)).toBeVisible();

  const texts = await shared(page);
  const invite = texts.find((t) => t.includes('#c='));
  expect(invite, 'הקישור לא נשלח').toBeTruthy();

  /**
   * הכלל שנשמר כאן: **התשובות לא נוסעות בקישור**. מטען שנושא טקסט
   * שילד הקליד ומגיע לילד אחר הוא ערוץ צ'אט, וזה אסור במשחק הזה.
   * לכן נבדק שהמטען המפוענח מכיל מספרים בלבד.
   */
  const payload = invite!.match(/#c=([A-Za-z0-9_-]+)/)![1];
  const decoded = await page.evaluate((p) => {
    const base64 = p.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return atob(padded);
  }, payload);
  const parsed = JSON.parse(decoded) as Record<string, unknown>;
  expect(Object.keys(parsed).sort()).toEqual(['by', 'cats', 'id', 'letter', 'pts', 'secs', 'v']);
  expect(decoded).not.toMatch(/answer|rawText|תשוב/);

  // ===== צד המקבל =====
  // הקישור מצביע על הדומיין האמיתי; בבדיקה פותחים את אותו hash מקומית
  const hash = invite!.slice(invite!.indexOf('#'));
  /**
   * לחיצה על קישור בוואטסאפ פותחת מסמך חדש. `goto` לאותה כתובת עם
   * hash אחר הוא ניווט **באותו מסמך** ולא טוען את האפליקציה מחדש,
   * ולכן היה בודק מסלול אחר לגמרי. המעבר דרך about:blank מכריח
   * טעינה אמיתית, כמו אצל הילד שקיבל את ההודעה.
   */
  await page.goto('about:blank');
  await page.goto(new URL(hash, baseURL).toString());

  await expect(page.getByRole('heading', { name: /מאתגר|אתגר/ }).first()).toBeVisible();
  await expect(page.locator('.challenge-letter')).toBeVisible();
  await expect(page.getByText(/צריך לעבור/)).toBeVisible();

  /**
   * הכתובת מנוקה מיד. בלי זה רענון באמצע המשחק היה מתחיל את האתגר
   * מחדש, והמטען היה נשאר בהיסטוריה ובשיתופי מסך.
   */
  expect(page.url()).not.toContain('#c=');

  await page.getByRole('button', { name: /מתחילים/ }).click();
  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();
  await page.getByRole('button', { name: /הבא|סיום|לתוצאות/ }).first().click();

  // ===== ההשוואה =====
  const card = page.locator('.challenge-result');
  await expect(card).toBeVisible();
  await expect(card.locator('.challenge-total')).toHaveCount(2);

  // הניקוד של השולח באמת נסע בקישור: הוא ענה, המקבל לא, ולכן
  // המספרים שונים. 0:0 היה עובר גם אם שום דבר לא הועבר.
  const totals = await card.locator('.challenge-total').allInnerTexts();
  const theirs = Number(totals[1]);
  expect(theirs, `הניקוד של המאתגר לא הגיע: ${totals.join(' / ')}`).toBeGreaterThan(0);
  expect(Number(totals[0])).not.toBe(theirs);
  await expect(page.getByRole('heading', { name: /סוף האתגר/ })).toBeVisible();

  expect(errors, errors.join('\n')).toHaveLength(0);
});

test('🎯 קישור פגום לא מפיל את המשחק', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  // מטען שאינו base64 תקין בכלל — הגרוע ביותר שאפשר לקבל בוואטסאפ
  await page.goto('./#c=not-a-real-payload');

  // אין אתגר, ולכן המשחק נפתח כרגיל ולא במסך אתגר
  await expect(page.getByRole('button', { name: /בואו נשחק/ })).toBeVisible();
  expect(errors, errors.join('\n')).toHaveLength(0);
});

test('🎯 אפליקציה שכבר פתוחה קולטת קישור בלי טעינה מחדש', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  await captureShares(page);
  await page.goto('./');
  await playOneRound(page, true);
  await page.getByRole('button', { name: /לשלוח אתגר/ }).click();
  const invite = (await shared(page)).find((t) => t.includes('#c='))!;

  /**
   * המסלול ה"חם": האפליקציה כבר רצה והכתובת משתנה תחתיה — הדבקה
   * בשורת הכתובת, או קישור שנפתח לתוך חלון קיים. בלי מאזין
   * hashchange הילד היה נשאר במסך שבו היה, והקישור לא היה עושה כלום.
   */
  await page.goto(`./${invite.slice(invite.indexOf('#'))}`);

  await expect(page.locator('.challenge-letter')).toBeVisible();
  expect(page.url()).not.toContain('#c=');
  expect(errors, errors.join('\n')).toHaveLength(0);
});

test('💬 משפט מוכן עובר לחבר, ובקישור נוסע מספר ולא טקסט', async ({ page, baseURL }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  await captureShares(page);
  await page.goto('./');
  await playOneRound(page, true);

  // בוחרים משפט לפני השליחה
  const phrase = QUICK_PHRASES[0];
  await page.getByRole('button', { name: new RegExp(phrase.text) }).first().click();
  await page.getByRole('button', { name: /לשלוח אתגר/ }).click();
  const invite = (await shared(page)).find((t) => t.includes('#c='))!;

  /**
   * הכלל שנשמר כאן: בקישור נוסע **מזהה מספרי**. אם מישהו יחליף את
   * זה בטקסט, הכלל "ללא צ'אט פתוח בין ילדים" נשבר — וזו הבדיקה
   * שתתפוס את זה.
   */
  const payload = invite.match(/#c=([A-Za-z0-9_-]+)/)![1];
  const decoded = await page.evaluate((p) => {
    const b = p.replace(/-/g, '+').replace(/_/g, '/');
    return atob(b + '='.repeat((4 - (b.length % 4)) % 4));
  }, payload);
  const parsed = JSON.parse(decoded) as { msg?: unknown };
  expect(parsed.msg).toBe(phrase.id);
  expect(decoded).not.toContain(phrase.text);

  // ===== אצל החבר =====
  await page.goto('about:blank');
  await page.goto(new URL(invite.slice(invite.indexOf('#')), baseURL).toString());

  // המשפט מוצג במסך קבלת האתגר
  await expect(page.getByText(phrase.text).first()).toBeVisible();

  // ובתחתית מסך המשחק, עם השם של מי שאמר אותו
  await page.getByRole('button', { name: /מתחילים/ }).click();
  const bar = page.locator('.quick-chat');
  await expect(bar).toBeVisible();
  await expect(bar.getByText(phrase.text)).toBeVisible();

  // אין תיבת הקלדה בשורת ההודעות — רק בחירה מרשימה
  await expect(bar.locator('input, textarea')).toHaveCount(0);

  // בוחרים תשובה, והיא נשמרת עד השליחה החוזרת
  const answer = QUICK_PHRASES[1];
  await bar.getByRole('button', { name: /להגיב/ }).click();
  await bar.getByRole('button', { name: new RegExp(answer.text) }).click();
  await expect(bar.getByText(/יישלח עם האתגר החוזר/)).toBeVisible();

  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();
  await page.getByRole('button', { name: /הבא|סיום|לתוצאות/ }).first().click();

  // התשובה שנבחרה במשחק היא ברירת המחדל לאתגר החוזר
  const back = page.locator('.challenge-invite');
  await expect(back.getByRole('button', { name: new RegExp(answer.text) })).toHaveAttribute(
    'aria-pressed',
    'true'
  );

  expect(errors, errors.join('\n')).toHaveLength(0);
});

test('⚔️ תוצאת אתגר נרשמת ביומן הראש-בראש ושורדת רענון', async ({ page, baseURL }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  await captureShares(page);
  await page.goto('./');
  await playOneRound(page, true);
  await page.getByRole('button', { name: /לשלוח אתגר/ }).click();
  const invite = (await shared(page)).find((t) => t.includes('#c='))!;
  const rival = invite.split(' ')[0];

  // החבר פותח את הקישור ומשחק בלי לענות — ולכן מפסיד
  await page.goto('about:blank');
  await page.goto(new URL(invite.slice(invite.indexOf('#')), baseURL).toString());
  await page.getByRole('button', { name: /מתחילים/ }).click();
  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();
  await page.getByRole('button', { name: /הבא|סיום|לתוצאות/ }).first().click();
  await expect(page.locator('.challenge-result')).toBeVisible();

  await page.getByRole('button', { name: /למסך הבית/ }).click();

  const card = page.locator('.rivals-card');
  await expect(card).toBeVisible();
  await expect(card.locator('.rival-name')).toHaveText(rival);
  // הפסד אחד: 0 ניצחונות מול 1
  await expect(card.locator('.rival-score')).toContainText('0');
  await expect(card.getByText(new RegExp(`${rival} מוביל`))).toBeVisible();

  /**
   * המבחן האמיתי הוא טעינה חדשה: יומן שיושב רק בזיכרון נראה עובד
   * בדיוק עד שסוגרים את האפליקציה.
   *
   * לא `reload` אלא לשונית חדשה **באותו הקשר**, כי ה-`beforeEach`
   * כאן מוחק את IndexedDB ב-init script של הדף הזה — רענון היה
   * מוחק את היומן ואז בודק את המחיקה של הבדיקה עצמה. לשונית חדשה
   * חולקת את אותו אחסון בלי אותו script.
   */
  const fresh = await page.context().newPage();
  await stubExternalSources(fresh);
  await fresh.goto('./');
  await fresh.getByRole('button', { name: /בואו נשחק/ }).click();
  await expect(fresh.locator('.rivals-card .rival-name')).toHaveText(rival);

  /**
   * ואותו אתגר לא נספר פעמיים — טעינה חוזרת של מסך התוצאות הייתה
   * מכפילה את התוצאה ביומן בלי שאף אחד ישים לב.
   */
  const games = await fresh.locator('.rivals-card .rival-score').first().innerText();
  expect(games.replace(/\D/g, ''), 'התוצאה נספרה יותר מפעם אחת').toBe('01');
  await fresh.close();

  expect(errors, errors.join('\n')).toHaveLength(0);
});
