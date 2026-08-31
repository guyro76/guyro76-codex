/**
 * צילומי מסך לחנות האפליקציות.
 *
 * למה סקריפט ולא צילום ידני: החנות דורשת לפחות שני צילומים, וכל
 * שינוי בעיצוב הופך אותם לתמונה של גרסה שכבר לא קיימת. צילום ידני
 * נעשה פעם אחת ומזדקן בשקט. הסקריפט הזה מייצר אותם מחדש בפקודה
 * אחת, מהמשחק האמיתי ולא מתמונת עיצוב — מה שרואים בחנות הוא מה
 * שמקבלים.
 *
 * הרשת חסומה בדיוק כמו בבדיקות, כדי שהצילום לא יתלה בוויקיפדיה
 * ולא ישתנה בין הרצה להרצה.
 *
 * הרצה:  node scripts/store-screenshots.mjs
 * הפלט:  store/screenshots/*.png  (1080×1920, היחס שגוגל מבקשת)
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(root, 'store/screenshots');
const PORT = 4180;
const BASE = `http://127.0.0.1:${PORT}/`;

/**
 * מידות של טלפון אמיתי, לא של חלון ענק.
 *
 * הניסיון הראשון היה `viewport: 1080×1920`, וזה יצא לא נכון: 1080
 * **פיקסלי CSS** הם רוחב של מחשב, ולכן העימוד עבר לפריסת דסקטופ
 * והתוכן ישב בשליש העליון של תמונה ריקה. טלפון הוא ~360 פיקסלי CSS
 * עם צפיפות 3. הפלט זהה בגודלו — 1080×1920 — אבל זה מה שילד באמת
 * רואה.
 */
const VIEWPORT = { width: 360, height: 640 };
const SCALE = 3;

const CHROMIUM = '/opt/pw-browsers/chromium';

/** ממתין שהשרת יענה, במקום להמר על זמן קבוע */
async function waitForServer(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* עוד לא עלה */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`השרת לא עלה על ${url}`);
}

/** אותה חסימה כמו ב-e2e/helpers.ts — בלי רשת חיצונית */
async function stubNetwork(page) {
  await page.route('**he.wikipedia.org/**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ query: { search: [] } })
    })
  );
  await page.route('**api.openverse.org/**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ results: [] })
    })
  );
}

/**
 * ממתין לסיום אנימציות הכניסה — **רק הסופיות**. לגלגל הארץ יש
 * `iterations: Infinity`, והמתנה לו לא תסתיים לעולם.
 */
async function settle(page) {
  await page.evaluate(() => {
    const finite = document
      .getAnimations()
      .filter((a) => Number.isFinite(a.effect?.getTiming().iterations ?? 1));
    return Promise.race([
      Promise.all(finite.map((a) => a.finished.catch(() => undefined))),
      new Promise((done) => setTimeout(done, 1500))
    ]).then(() => undefined);
  });
  await page.waitForTimeout(400);
}

/**
 * כיתובים לצילומי החנות.
 *
 * צילום "נקי" מראה מסך; צילום עם כיתוב מוכר יתרון. בחנות רואים את
 * הצילומים לפני שקוראים את התיאור, ולרוב במקום התיאור — ולכן
 * המשפט שעל הצילום הוא מה שנקרא בפועל.
 *
 * מי שאין לו כיתוב פשוט נשאר נקי.
 */
const CAPTIONS = {
  '02-home': 'הכול מתחיל בלחיצה אחת',
  '05-letter-wheel': 'מגרילים אות — וכולם מתחילים ממנה',
  '07-board': 'ארצי נותן רמזים, לא תשובות',
  '08-round-results': 'הניקוד מיד, בלי לריב מי צודק',
  '10-album': 'כל מילה שגיליתם נשארת אצלכם'
};

let shot = 0;
async function capture(page, name) {
  await settle(page);
  shot++;
  const id = `${String(shot).padStart(2, '0')}-${name}`;
  const file = resolve(OUT, `${id}.png`);
  await page.screenshot({ path: file });
  console.log(`  ✓ ${id}`);
  const caption = CAPTIONS[id];
  if (caption) await withCaption(page.context(), file, caption, resolve(OUT, `${id}-caption.png`));
}

/**
 * מוסיף רצועת כיתוב מעל הצילום.
 *
 * נעשה בדפדפן ולא בספריית תמונות: כך הטיפוגרפיה העברית וכיוון
 * ימין-לשמאל יוצאים נכון בלי תלות נוספת, ובלי לצייר טקסט ביד.
 */
async function withCaption(context, sourceFile, text, outFile) {
  const { readFile } = await import('node:fs/promises');
  const b64 = (await readFile(sourceFile)).toString('base64');
  const page = await context.newPage();
  await page.setViewportSize({ width: VIEWPORT.width, height: VIEWPORT.height });
  await page.setContent(
    `<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><style>
      html,body{margin:0;height:100%;background:#1b1035;}
      .wrap{height:100%;display:flex;flex-direction:column;
        font-family:'Heebo','Segoe UI','Arial Hebrew',system-ui,sans-serif;}
      /* גדול. בחנות רואים את הצילום בגודל אצבע, וכיתוב קטן
         פשוט לא נקרא — כלומר לא קיים. */
      .cap{flex:0 0 auto;padding:48px 40px 40px;text-align:center;color:#f4f2ff;
        font-size:58px;font-weight:800;line-height:1.25;
        background:linear-gradient(160deg,#2b1b5a,#1b1035);}
      .shot{flex:1 1 auto;min-height:0;overflow:hidden;}
      .shot img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;}
    </style><div class="wrap"><div class="cap">${text}</div>
    <div class="shot"><img src="data:image/png;base64,${b64}"></div></div>`,
    { waitUntil: 'load' }
  );
  await page.screenshot({ path: outFile });
  await page.close();
}

async function main() {
  if (!existsSync(resolve(root, 'dist/index.html'))) {
    throw new Error('אין בנייה. להריץ קודם: npm run build');
  }
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--host', '127.0.0.1'], {
    cwd: root,
    stdio: 'ignore'
  });

  try {
    await waitForServer(BASE);

    const browser = await chromium.launch({
      executablePath: existsSync(CHROMIUM) ? CHROMIUM : undefined,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: SCALE,
      isMobile: true,
      hasTouch: true,
      locale: 'he-IL'
    });
    const page = await context.newPage();
    // מתחילים ממכשיר נקי, כדי שהצילום לא יציג נתונים מהרצה קודמת
    await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
    await stubNetwork(page);

    console.log('מצלם:');

    await page.goto(BASE);
    await capture(page, 'splash');

    await page.getByRole('button', { name: /בואו נשחק/ }).click();
    await page.getByRole('button', { name: /משחק חדש/ }).waitFor();

    /**
     * בוחרים שם, כמו שחקן אמיתי עושה בכניסה הראשונה.
     * בלי זה הצילומים מראים את תווית ברירת המחדל ("שחקן חדש")
     * בכל פנייה — וזה נראה כמו מסך לא גמור.
     */
    const nameField = page.getByRole('textbox', { name: 'השם שלי' });
    if (await nameField.isVisible().catch(() => false)) {
      await nameField.fill('דנה');
      await page.getByRole('button', { name: 'זהו!' }).click();
      await page.waitForTimeout(400);
    }
    await capture(page, 'home');

    await page.getByRole('button', { name: /משחק חדש/ }).click();
    await capture(page, 'modes');

    await page.locator('select').first().selectOption('1');
    await page.getByRole('button', { name: /משחק יחיד/ }).click();
    await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
    await capture(page, 'categories');

    await page.getByRole('button', { name: /להגרלת האות/ }).click();
    await page.locator('.letter-wheel').click();
    await page.getByRole('button', { name: /מתחילים/ }).waitFor({ timeout: 20_000 });
    await capture(page, 'letter-wheel');

    await page.getByRole('button', { name: /מתחילים/ }).click();
    await page.locator('.cat-card').first().waitFor();

    /**
     * ממלאים בעזרת ארצי, כדי שהצילום יראה משחק שמשחקים בו ולא לוח
     * ריק. הנתיב דטרמיניסטי: שני רמזים ואז "גלו לי", שממלא תשובה
     * מאומתת מהמאגר המקומי.
     *
     * **כל הקטגוריות ולא רק הראשונה.** בגרסה הראשונה מולאה אחת,
     * ומסך התוצאות בצילום הראה "+0 נק׳" וארבע שורות "ריק" — צילום
     * שמראה את המשחק נכשל. צילום לחנות צריך להראות משחק שהצליח.
     */
    const cards = page.locator('.cat-card');
    const total = await cards.count();
    for (let i = 0; i < total; i++) {
      const card = cards.nth(i);
      const hint = card.getByRole('button', { name: /רמז/ }).first();
      if (!(await hint.isEnabled().catch(() => false))) continue;
      await hint.click();
      const more = card.getByRole('button', { name: /עוד רמז/ });
      if (await more.isVisible().catch(() => false)) await more.click();
      if (i === 0) await capture(page, 'artzi-hint');
      const reveal = card.getByRole('button', { name: /גלו לי/ });
      if (await reveal.isVisible().catch(() => false)) await reveal.click();
    }
    await capture(page, 'board');

    await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();
    await page.getByRole('heading', { name: /תוצאות הסיבוב/ }).waitFor({ timeout: 25_000 });
    const closeNew = page.getByRole('button', { name: /מעולה|למילה הבאה/ });
    while (await closeNew.first().isVisible().catch(() => false)) {
      await closeNew.first().click();
      await page.waitForTimeout(200);
    }
    await capture(page, 'round-results');

    await page.getByRole('button', { name: /לתוצאות המשחק/ }).click();
    await capture(page, 'match-results');

    await page.getByRole('button', { name: 'למסך הבית' }).click();
    await page.getByRole('button', { name: /אוסף המילים שלי/ }).click();
    await page.getByRole('heading', { name: /אוסף המילים שלי/ }).waitFor();
    await capture(page, 'album');

    await browser.close();
    console.log(`\nהצילומים ב-${OUT}`);
  } finally {
    server.kill();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
