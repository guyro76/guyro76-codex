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
const vercel = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8')) as {
  headers: { source: string; headers: { key: string; value: string }[] }[];
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
    expect(csp).toContain("frame-ancestors 'none'");
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
});
