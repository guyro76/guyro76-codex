import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');
const fn = readFileSync(resolve(root, 'supabase/functions/delete-account/index.ts'), 'utf8');
const client = readFileSync(resolve(root, 'src/lib/supabase.ts'), 'utf8');
const screen = readFileSync(resolve(root, 'src/screens/Account.tsx'), 'utf8');
const policy = readFileSync(resolve(root, 'public/privacy.html'), 'utf8');

/**
 * מחיקת חשבון מתוך האפליקציה היא דרישה של אפל מרגע שיש הרשמה
 * (App Store Review Guidelines 5.1.1(v)). בלעדיה ההגשה נדחית.
 */
describe('מחיקת חשבון', () => {
  it('יש מסלול מחיקה במסך החשבון', () => {
    expect(screen).toContain('מחיקת החשבון');
    expect(screen).toContain('deleteAccount');
  });

  /**
   * הכלל החמור ביותר כאן. מפתח service role עוקף כל מדיניות RLS,
   * ולכן הוא חייב להישאר בשרת. אם הוא ידלוף לקוד צד לקוח, כל מי
   * שיפתח את הבנדל יוכל למחוק ולשנות נתונים של כל משתמש.
   */
  it('מפתח ה-service role לא מגיע לקוד צד לקוח', () => {
    // הערות מוסרות לפני הבדיקה: אזכור בהערה שמסבירה *למה* המפתח לא
    // כאן הוא בדיוק ההפך מדליפה, ובלי ההסרה הבדיקה נופלת על עצמה.
    const stripComments = (text: string) =>
      text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

    for (const file of ['src/lib/supabase.ts', 'src/screens/Account.tsx']) {
      const code = stripComments(readFileSync(resolve(root, file), 'utf8'));
      // קריאה למשתנה סביבה של מפתח סודי
      expect(code, `${file} קורא מפתח סודי`).not.toMatch(/service[_-]?role/i);
      // או מפתח שהוטמע ישירות — JWT ארוך בקוד
      expect(code, `${file} מכיל מפתח מוטמע`).not.toMatch(/eyJ[A-Za-z0-9_.-]{40,}/);
    }

    // ובפונקציה עצמה הוא נקרא מסביבת הריצה ולא מוטמע בקוד
    expect(fn).toContain("Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')");
    expect(fn).not.toMatch(/eyJ[A-Za-z0-9_.-]{40,}/);
  });

  /**
   * הזהות נגזרת מה-JWT החתום ולא מגוף הבקשה. אחרת אפשר היה לשלוח
   * מזהה של משתמש אחר ולמחוק לו את החשבון.
   */
  it('השרת גוזר את הזהות מהאסימון, לא מהבקשה', () => {
    expect(fn).toContain('admin.auth.getUser(token)');
    expect(fn).toContain('deleteUser(data.user.id)');
    // אסור שהמזהה יגיע מגוף הבקשה
    expect(fn).not.toMatch(/deleteUser\(\s*body/);
    expect(fn).not.toMatch(/req\.json\(\)/);
  });

  it('בקשה בלי אסימון נדחית', () => {
    expect(fn).toContain("if (!token) return json({ error: 'missing token' }, 401)");
  });

  /**
   * הסדר: שרת קודם, מכשיר אחר כך. הפוך — אם השרת נכשל אחרי שהמכשיר
   * נמחק — נשאר חשבון בשרת שאי אפשר להגיע אליו, וזו בדיוק ההפך
   * ממה שהובטח.
   */
  it('נכשלת בשרת — לא נמחק כלום במכשיר', () => {
    const body = screen.slice(screen.indexOf('const eraseEverything'));
    const serverCall = body.indexOf('await deleteAccount()');
    const localWipe = body.indexOf('db.delete()');
    expect(serverCall).toBeGreaterThan(-1);
    expect(localWipe).toBeGreaterThan(serverCall);
    expect(body).toContain("if (result === 'failed')");
  });

  /** מחיקה היא בלתי הפיכה — לחיצה אחת בטעות לא אמורה להספיק */
  it('דורש הקלדת מילת אישור', () => {
    expect(screen).toContain("CONFIRM_WORD = 'מחיקה'");
    expect(screen).toContain('confirmText.trim() !== CONFIRM_WORD');
  });

  /**
   * בבנייה בלי Supabase אין חשבון בשרת. זה מצב תקין, והמסך חייב
   * להמשיך למחוק את המכשיר במקום להציג כשל.
   */
  it('בלי חשבונות בכלל — עדיין מוחק את המידע במכשיר', () => {
    expect(client).toContain("return 'local-only'");
    const body = screen.slice(screen.indexOf('const eraseEverything'));
    expect(body).toContain("if (result === 'failed')");
    expect(body).not.toContain("result !== 'deleted'");
  });

  /** מה שמובטח למשתמש חייב להופיע גם במדיניות שהחנות קוראת */
  it('מדיניות הפרטיות מזכירה מחיקה', () => {
    expect(policy).toContain('מחיקת מידע');
  });
});
