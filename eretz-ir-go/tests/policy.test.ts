import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * בדיקות שמירה על ההבטחות שהאפליקציה מצהירה עליהן: כותרות האבטחה,
 * ועמוד מדיניות הפרטיות שחנויות האפליקציות דורשות.
 *
 * הן קיימות כדי שאף שינוי עתידי לא ישמיט בשקט את ה-CSP או ישאיר את
 * המדיניות בלי הסעיפים שנדרשים לאישור בחנות.
 */
const root = resolve(__dirname, '..');
/** שורש ה-monorepo, מעל ספריית המשחק */
const root2 = resolve(__dirname, '..', '..');
const vercel = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8')) as {
  headers: { source: string; headers: { key: string; value: string }[] }[];
  git?: { deploymentEnabled?: Record<string, boolean> };
};
const netlify = readFileSync(resolve(root, 'netlify.toml'), 'utf8');
const policy = readFileSync(resolve(root, 'public/privacy.html'), 'utf8');

const globalHeaders = vercel.headers.find((h) => h.source === '/(.*)')!;
const header = (key: string) => globalHeaders.headers.find((h) => h.key === key)?.value ?? '';

describe('כותרות אבטחה', () => {
  it('כל הכותרות החיוניות מוגדרות', () => {
    for (const key of [
      'Content-Security-Policy',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Referrer-Policy',
      'Permissions-Policy',
      'Cross-Origin-Opener-Policy'
    ]) {
      expect(header(key), `חסרה הכותרת ${key}`).not.toBe('');
    }
  });

  it('ה-CSP נועל את המשחק למקורות שלו ולוויקיפדיה בלבד', () => {
    const csp = header('Content-Security-Policy');
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("connect-src 'self' https://he.wikipedia.org");
    expect(csp).toContain("object-src 'none'");
    // 'self' ולא 'none': התצוגה המקדימה בניהול מסגרת את המשחק מאותו מקור.
    // המסגור מצד אתר זר — הסיכון האמיתי — נשאר חסום. ראו את הבדיקה הייעודית למטה.
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain("base-uri 'self'");
  });

  it('ה-CSP לא מרשה סקריפטים חיצוניים או inline', () => {
    const csp = header('Content-Security-Policy');
    const scriptSrc = csp.split(';').find((p) => p.trim().startsWith('script-src')) ?? '';
    expect(scriptSrc).toContain("'self'");
    expect(scriptSrc).not.toContain('unsafe-inline');
    expect(scriptSrc).not.toContain('unsafe-eval');
    expect(scriptSrc).not.toContain('http');
  });

  it('מצלמה, מיקרופון ומיקום חסומים ברמת הדפדפן', () => {
    const pp = header('Permissions-Policy');
    for (const feature of ['camera=()', 'microphone=()', 'geolocation=()']) {
      expect(pp).toContain(feature);
    }
  });

  it('Netlify ו-Vercel מגדירים את אותו CSP — שלא יהיה הבדל בין הפלטפורמות', () => {
    expect(netlify).toContain(header('Content-Security-Policy'));
  });
});

describe('מדיניות הפרטיות הציבורית', () => {
  it('בעברית ובכיוון RTL', () => {
    expect(policy).toContain('lang="he"');
    expect(policy).toContain('dir="rtl"');
  });

  it('כוללת את הסעיפים שחנויות האפליקציות דורשות', () => {
    for (const section of ['עודכן לאחרונה', 'COPPA', 'GDPR-K', 'יצירת קשר', 'מחיקת מידע']) {
      expect(policy, `חסר בעמוד: ${section}`).toContain(section);
    }
  });

  it('מציינת דרך יצירת קשר אמיתית', () => {
    expect(policy).toMatch(/mailto:[^"]+@[^"]+/);
  });

  it('מצהירה במפורש שאין שימוש בשירותי AI חיצוניים', () => {
    expect(policy).toContain('OpenAI');
    expect(policy).toContain('Anthropic');
    expect(policy).toMatch(/אינן נשלחות/);
  });

  it('מגלה שגם כתובת ה-IP מגיעה לוויקימדיה — ולא רק המילה', () => {
    expect(policy).toContain('IP');
    expect(policy).toContain('ויקימדיה');
  });

  it('לא מבטיחה הבטחות שהקוד לא מקיים', () => {
    // מרגע שיש חשבונות, אסור שהמדיניות תמשיך לטעון שאין שרת ואין מייל
    expect(policy).not.toContain('אין לנו שרת');
    expect(policy).not.toContain('אין חשבון משתמש');
    expect(policy).toMatch(/ללא פרסומות|אין.*פרסומות|פרסומות מכל סוג/);
  });

  it('מפרטת מה נשמר בשרת ומה נשאר במכשיר', () => {
    expect(policy).toContain('Supabase');
    expect(policy).toContain('כתובת מייל');
    expect(policy).toMatch(/לא עולים לשרת|המכשיר בלבד/);
  });

  it('מסבירה את שלוש דרכי הכניסה ואת מה שלא מגיע אלינו', () => {
    for (const s of ['Google', 'Apple', 'hash']) expect(policy).toContain(s);
  });

  it('דורשת הורה ליצירת חשבון לילד מתחת ל-13', () => {
    expect(policy).toMatch(/מתחת לגיל 13/);
    expect(policy).toMatch(/הורה או אפוטרופוס/);
  });

  /**
   * הענף gh-pages מכיל תוצרי בנייה בלבד. ספריית השורש של הפרויקט
   * ב-Vercel ("eretz-ir-go") לא קיימת בו, ולכן כל דחיפה יצרה פריסה
   * אדומה לצד הפריסה התקינה מ-main. זה לא שבר את האתר, אבל הפך את
   * רשימת הפריסות לבלתי קריאה — ובמצב כזה כשל אמיתי נבלע ברעש.
   *
   * לחסימה יש שני חלקים, ושניהם נדרשים:
   *  1. ההצהרה כאן ב-vercel.json שבמאגר.
   *  2. עותק שלה שנוצר בתוך תוצר הבנייה עצמו, כי Vercel נכשל על
   *     ספריית השורש החסרה עוד לפני שהוא מגיע לקרוא את הקובץ שבמאגר.
   * הבדיקה מוודאת את שניהם, אחרת מספיק שאחד ייעלם והפריסות האדומות
   * יחזרו בלי שאיש ישים לב.
   */
  /**
   * מסגור: צד שלישי חסום, אנחנו עצמנו מותרים.
   *
   * ההקלה הזו נדרשת לתצוגה המקדימה במסך הניהול, שמריצה את המשחק
   * עצמו ב-iframe מאותו מקור. הסיכון האמיתי בקליקג'קינג הוא אתר זר
   * שמסגר אותנו כדי לגנוב לחיצות — וזה נשאר חסום לחלוטין. אם מישהו
   * ישנה את זה ל-'*' או יסיר את הכותרת, הבדיקה תיפול.
   */
  it('רק אנחנו רשאים למסגר את המשחק — לא אף אתר אחר', () => {
    expect(header('Content-Security-Policy')).toContain("frame-ancestors 'self'");
    expect(header('Content-Security-Policy')).not.toContain('frame-ancestors *');
    expect(header('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(netlify).toContain("frame-ancestors 'self'");
    expect(netlify).toContain('X-Frame-Options = "SAMEORIGIN"');
  });

  /**
   * המאגר הזה הוא monorepo: לצד המשחק יושבים בו פרויקטים אחרים
   * (organo, paprika) שלכל אחד מהם vercel.json משלו. כל דחיפה לענף
   * פיתוח של המשחק הפעילה בנייה של אותם פרויקטים — בנייה שנכשלת —
   * והפיקה מייל "Failed preview deployment" על כל קומיט. השגיאה לא
   * נגעה למשחק כלל, אבל היא הציפה את תיבת הדואר והסתירה כשלים
   * אמיתיים.
   *
   * Vercel קורא את vercel.json מספריית השורש של הפרויקט, ולכן ההצהרה
   * בשורש המאגר לא חלה על פרויקט שספריית השורש שלו היא תת-ספרייה.
   * הדגל חייב להופיע בשני המקומות.
   */
  it('רק המשחק נפרס אוטומטית — שאר הפרויקטים במאגר לא', () => {
    const root = JSON.parse(readFileSync(resolve(root2, 'vercel.json'), 'utf8')) as {
      git?: { deploymentEnabled?: unknown };
    };
    const paprika = JSON.parse(readFileSync(resolve(root2, 'paprika-app/vercel.json'), 'utf8')) as {
      git?: { deploymentEnabled?: unknown };
    };
    expect(root.git?.deploymentEnabled).toBe(false);
    expect(paprika.git?.deploymentEnabled).toBe(false);
  });

  it('Vercel לא מנסה לפרוס את ענף התוצרים gh-pages', () => {
    expect(vercel.git?.deploymentEnabled?.['gh-pages']).toBe(false);

    const workflow = readFileSync(
      resolve(root, '..', '.github/workflows/eretz-ir-go-pages.yml'),
      'utf8'
    );
    expect(workflow).toContain('mkdir -p eretz-ir-go');
    expect(workflow).toMatch(/deploymentEnabled.*gh-pages.*false/);
  });
});
