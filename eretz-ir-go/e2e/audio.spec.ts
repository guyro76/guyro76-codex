import { test, expect, type Page } from '@playwright/test';
import { stubExternalSources } from './helpers';

/**
 * אודיו — הבדיקה הקריטית לאייפון.
 *
 * ב-iOS Safari ה-AudioContext נשאר 'suspended' לנצח אם הוא לא נוצר
 * *בתוך* מחווה של המשתמש. כאן מוודאים שהמאזין הגלובלי אכן פותח context
 * ומעביר אותו למצב 'running' כבר בלחיצה הראשונה, ושהמשחק אמנם מנגן
 * (יוצר oscillators) בסיבוב הגלגל ובבחירת האות.
 *
 * Chromium מריץ עם autoplay policy דומה ל-iOS, ולכן ההתנהגות הזו נבדקת
 * באמת ולא רק על הנייר.
 */

/** עוטף את AudioContext כדי לספור כמה צלילים באמת נוצרו */
async function instrumentAudio(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as {
      AudioContext: typeof AudioContext;
      __audio: { contexts: number; oscillators: number; state: () => string };
    };
    const Real = w.AudioContext;
    const stats = { contexts: 0, oscillators: 0, state: () => 'none' };
    w.__audio = stats;
    w.AudioContext = class extends Real {
      constructor(...args: ConstructorParameters<typeof AudioContext>) {
        super(...args);
        stats.contexts++;
        stats.state = () => this.state;
      }
      createOscillator(): OscillatorNode {
        stats.oscillators++;
        return super.createOscillator();
      }
    } as typeof AudioContext;
  });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await stubExternalSources(page);
});

test('🔊 האודיו נפתח כבר בלחיצה הראשונה ומנגן בגלגל האות', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(String(err)));

  await instrumentAudio(page);
  await page.goto('./');

  // לפני נגיעה — אין AudioContext בכלל (לא נוצר בטעינת המודול)
  expect(await page.evaluate(() => (window as never as { __audio: { contexts: number } }).__audio.contexts)).toBe(0);

  await page.getByRole('button', { name: /בואו נשחק/ }).click();

  // אחרי המחווה הראשונה — context קיים ופעיל. זה בדיוק מה שחסר באייפון.
  const after = await page.evaluate(() => {
    const a = (window as never as { __audio: { contexts: number; state: () => string } }).__audio;
    return { contexts: a.contexts, state: a.state() };
  });
  expect(after.contexts).toBe(1);
  expect(after.state).toBe('running');

  await page.getByRole('button', { name: /משחק חדש/ }).click();
  // ההגדרות נמצאות מעל רשימת המצבים, כי לחיצה על מצב מתקדמת מיד
  await page.locator('select').first().selectOption('1');
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();

  const before = await page.evaluate(() => (window as never as { __audio: { oscillators: number } }).__audio.oscillators);
  await page.locator('.letter-wheel').click();
  await expect(page.getByRole('button', { name: /מתחילים/ })).toBeVisible({ timeout: 20_000 });

  // סיבוב הגלגל מנגן סווש + קליקים + צליל בחירה — הרבה יותר מצליל בודד
  const played = await page.evaluate(() => (window as never as { __audio: { oscillators: number } }).__audio.oscillators);
  expect(played - before).toBeGreaterThan(10);

  expect(errors, `שגיאות קונסול: ${errors.join(' | ')}`).toEqual([]);
});
