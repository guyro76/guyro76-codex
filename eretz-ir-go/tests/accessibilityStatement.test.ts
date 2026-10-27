import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');
const statement = read('public/accessibility.html');
const plain = statement.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

/**
 * הצהרת נגישות.
 *
 * אתר שפונה לציבור בישראל מצופה לפרסם הצהרה: לאיזה תקן הוא שואף, מה
 * נעשה, מה עוד חסר ולמי פונים. עד 27 באוקטובר 2026 לא הייתה אחת —
 * והנגישות עצמה, מעבר ל-axe ולניגודיות, לא הייתה מתועדת בשום מקום
 * שהורה יכול לקרוא.
 *
 * הבדיקות כאן נועדו לשמור על הדבר החשוב ביותר בהצהרה: שהיא **לא
 * מגזימה**. הצהרה שאומרת "האתר נגיש" בלי בדיקה ידנית היא גרועה
 * מהיעדר הצהרה.
 */
describe('הצהרת נגישות', () => {
  it('בעברית ובכיוון RTL', () => {
    expect(statement).toContain('lang="he"');
    expect(statement).toContain('dir="rtl"');
  });

  it('מציינת את התקן ותאריך עדכון', () => {
    expect(plain).toContain('תקן ישראלי 5568');
    expect(plain).toMatch(/עודכן לאחרונה: \d+ ב[א-ת]+ 20\d\d/);
  });

  it('מציינת דרך פנייה אמיתית ורכז נגישות', () => {
    expect(statement).toMatch(/mailto:[^"]+@[^"]+/);
    expect(plain).toContain('רכז הנגישות');
  });

  it('מגדירה במפורש שהיא לא טוענת לעמידה מלאה', () => {
    expect(plain).toMatch(/לא טוענים שהוא עומד בכל הדרישות/);
  });

  it('מפרטת מגבלות ידועות, ובהן העובדה שלא נעשתה בדיקה ידנית עם קורא מסך', () => {
    expect(plain).toContain('מגבלות ידועות');
    expect(plain).toMatch(/לא נעשתה בדיקה ידנית עם קורא מסך/);
    expect(plain).toContain('נינג');
  });

  it('לא כוללת טענה מוחלטת על נגישות מלאה', () => {
    for (const bad of ['נגיש לחלוטין', 'עומד בכל הדרישות של', 'נגיש לכל', 'מאושר על ידי']) {
      expect(plain, `ניסוח מוגזם: ${bad}`).not.toContain(bad);
    }
  });

  it('מקושרת מהמשחק ומהמדיניות', () => {
    expect(read('src/screens/Privacy.tsx')).toContain('/accessibility.html');
    expect(read('src/screens/Login.tsx')).toContain('/accessibility.html');
    expect(read('public/privacy.html')).toContain('/accessibility.html');
  });
});

/**
 * ההצהרה טוענת דברים על המשחק. כל טענה שאפשר לאמת — מאומתת כאן מול
 * הקוד, כדי שהצהרה שהייתה נכונה היום לא תהפוך לשקרית בשקט מחר.
 */
describe('הטענות בהצהרה נכונות', () => {
  it('"הדילוג לתוכן" ו-main קיימים', () => {
    const app = read('src/App.tsx');
    expect(app).toContain('className="skip-link"');
    expect(app).toContain('id="main-content"');
  });

  it('"טקסט מוגדל" ו"הפחתת תנועה" קיימים בהגדרות', () => {
    const settings = read('src/screens/Settings.tsx');
    expect(settings).toContain('טקסט מוגדל');
    expect(settings).toContain('הפחתת תנועה');
  });

  it('המשחק מכבד prefers-reduced-motion של המערכת', () => {
    expect(read('src/styles/global.css')).toContain('prefers-reduced-motion: reduce');
  });

  it('אפשר להגדיל את התצוגה: אין חסימת זום', () => {
    const html = read('index.html');
    expect(html).not.toMatch(/user-scalable\s*=\s*(no|0)/i);
    expect(html).not.toMatch(/maximum-scale\s*=\s*1(\.0)?\b/i);
  });

  it('אפשר לדלג על משחק ביניים בלי עונש', () => {
    expect(read('src/screens/MiniGame.tsx')).toContain('לדלג לאות הבאה');
  });

  it('אפשר לשחק בלי ספירת זמן', () => {
    expect(read('src/store/gameStore.ts')).toContain('setTimed');
  });

  it('לחלון קופץ יש שם נגיש ולכידת פוקוס', () => {
    const modal = read('src/components/Modal.tsx');
    expect(modal).toContain('aria-modal="true"');
    expect(modal).toContain('aria-labelledby');
    expect(modal).toMatch(/ev\.key !== 'Tab'|ev\.key === 'Tab'/);
  });

  /** והמגבלה שההצהרה מודה בה צריכה להישאר נכונה: אם "נינג'ה" יקבל מקלדת — לעדכן */
  it('נינג\'ה פירות עדיין בלי טיפול במקלדת (המגבלה בהצהרה)', () => {
    expect(read('src/components/minigames/FruitNinja.tsx')).not.toMatch(/onKeyDown|keydown/);
  });
});
