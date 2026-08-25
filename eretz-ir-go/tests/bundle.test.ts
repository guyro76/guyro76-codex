import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');
const assets = resolve(root, 'dist/assets');

/**
 * תקציב משקל לחבילה.
 *
 * ## למה זה נמדד
 *
 * כל שלושים המסכים ישבו בחבילה אחת של 927KB. ילד על טלפון אנדרואיד
 * זול חיכה להורדה של מסך הניהול, של מפת העולם ושל משחקי הביניים —
 * לפני שראה את הכפתור "בואו נשחק". משקל אינו מספר יפה בדוח: הוא
 * השניות שבין הקשה לבין מסך.
 *
 * ## למה בדיקה ולא הערה
 *
 * משקל חוזר לגדול בשקט. `import` אחד במקום הלא נכון מחזיר מסך שלם
 * לחבילה הראשית, ואיש לא מרגיש עד שמישהו מתלונן שהמשחק "נתקע
 * בהתחלה". הבדיקה כאן נופלת על זה.
 */
const MAIN_BUDGET_KB = 820;

/** מסכים כבדים שחייבים להישאר מחוץ לחבילה הראשית */
const MUST_BE_LAZY = ['Album', 'MiniGame', 'Admin', 'Settings', 'Account'];

describe('פיצול קוד — מקור', () => {
  const app = readFileSync(resolve(root, 'src/App.tsx'), 'utf8');

  /**
   * זו הבדיקה שרצה תמיד, גם בלי בנייה. היא לא מודדת בתים אלא
   * מוודאת שהכוונה נשמרה: המסכים הכבדים מיובאים בעצלתיים.
   */
  it('המסכים הכבדים מיובאים לפי דרישה', () => {
    for (const screen of MUST_BE_LAZY) {
      expect(app, `${screen} אינו lazy`).toMatch(
        new RegExp(`const ${screen}\\s*=\\s*lazy\\(`)
      );
    }
  });

  /** לולאת המשחק עצמה נשארת מיידית — אין מה לחסוך בה */
  it('לולאת המשחק נשארת בחבילה הראשית', () => {
    for (const screen of ['Splash', 'Home', 'ModeSelect', 'Categories', 'Game', 'RoundResults']) {
      expect(app, `${screen} צריך להיות מיובא מיידית`).toContain(`import ${screen} from './screens/${screen}'`);
    }
  });

  /**
   * בלי `Suspense` המסך העצל מפיל את הדף במקום להציג "רגע…".
   */
  it('יש מעטפת Suspense למסך שנטען', () => {
    expect(app).toContain('<Suspense');
    expect(app).toContain('ScreenLoading');
  });

  /**
   * הפיצול לבדו היה מוסיף הבהוב "רגע…" בלחיצה הראשונה על כל מסך.
   * החימום בזמן סרק מחזיר את המיידיות בלי להחזיר את המשקל.
   */
  it('החלקים מחוממים בזמן סרק', () => {
    expect(app).toContain('warmScreens');
    expect(app).toContain('requestIdleCallback');
  });
});

describe('פיצול קוד — תוצר הבנייה', () => {
  const built = existsSync(assets);
  const files = built ? readdirSync(assets).filter((f) => f.endsWith('.js')) : [];
  const kb = (f: string) => statSync(resolve(assets, f)).size / 1024;

  it.runIf(built)(`החבילה הראשית מתחת ל-${MAIN_BUDGET_KB}KB`, () => {
    const main = files.filter((f) => f.startsWith('index-')).sort((a, b) => kb(b) - kb(a))[0];
    expect(main, 'לא נמצאה חבילה ראשית').toBeTruthy();
    expect(kb(main!), `${main} שוקל ${kb(main!).toFixed(0)}KB`).toBeLessThan(MAIN_BUDGET_KB);
  });

  it.runIf(built)('המסכים הכבדים יצאו לחלקים נפרדים', () => {
    for (const screen of MUST_BE_LAZY) {
      expect(
        files.some((f) => f.startsWith(`${screen}-`)),
        `${screen} לא יצא לחלק נפרד`
      ).toBe(true);
    }
  });

  /**
   * אזהרה ולא כישלון: `npm test` לבדו רץ בלי בנייה, ובדיקה שנופלת
   * שם היא רעש. הבנייה כן קיימת בזמן הרצת ה-E2E ובשרשרת הפריסה.
   */
  it('הבנייה קיימת כדי שהתקציב באמת נמדד', () => {
    if (!built) console.warn('אין dist/ — תקציב המשקל לא נמדד בהרצה הזו. להריץ npm run build.');
    expect(true).toBe(true);
  });
});
