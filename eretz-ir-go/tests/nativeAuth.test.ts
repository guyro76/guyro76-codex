import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { NATIVE_REDIRECT, authCodeFrom, pickRedirect } from '../src/lib/supabase';

const root = resolve(__dirname, '..');

/**
 * ההתחברות באפליקציה עטופה נשברת בשקט: בדפדפן הכול עובד, ובאפליקציה
 * המשתמש נשלח לדפדפן ולא חוזר. אי אפשר להריץ כאן את המסלול הנייטיבי,
 * ולכן נבדקת ההחלטה עצמה — מה שכן ניתן לבדוק.
 */
describe('כתובת החזרה מהתחברות', () => {
  it('בדפדפן חוזרים לכתובת הנוכחית, בדיוק כמו קודם', () => {
    expect(pickRedirect(false, 'https://eretz-ir-go.vercel.app', '/')).toBe(
      'https://eretz-ir-go.vercel.app/'
    );
    expect(pickRedirect(false, 'https://example.com', '/game/')).toBe('https://example.com/game/');
  });

  /**
   * זה הבאג עצמו: באפליקציה `window.location.origin` הוא
   * `https://localhost`, ו-Supabase לא יכול להחזיר לשם.
   */
  it('באפליקציה לא חוזרים ל-localhost אלא לסכמת האפליקציה', () => {
    const native = pickRedirect(true, 'https://localhost', '/');
    expect(native).toBe(NATIVE_REDIRECT);
    expect(native).not.toContain('localhost');
  });

  /**
   * הסכמה נרשמת על ידי Capacitor לפי מזהה האפליקציה. אם המזהה
   * ישתנה בלי לעדכן כאן, ההתחברות תחזיר לסכמה שאף אחד לא מאזין לה.
   */
  it('הסכמה תואמת למזהה האפליקציה שרשום בפרויקט', () => {
    const appId = (JSON.parse(readFileSync(resolve(root, 'capacitor.config.json'), 'utf8')) as {
      appId: string;
    }).appId;
    expect(NATIVE_REDIRECT.startsWith(`${appId}://`)).toBe(true);

    const strings = readFileSync(resolve(root, 'android/app/src/main/res/values/strings.xml'), 'utf8');
    expect(strings).toContain(`<string name="custom_url_scheme">${appId}</string>`);
  });
});

describe('חילוץ קוד ההתחברות מהקישור', () => {
  it('מוצא קוד ב-query ובתוך fragment כאחד', () => {
    expect(authCodeFrom('com.eretzir.go://auth?code=abc123')).toBe('abc123');
    expect(authCodeFrom('com.eretzir.go://auth#code=xyz789')).toBe('xyz789');
    expect(authCodeFrom('com.eretzir.go://auth?state=1&code=mid&other=2')).toBe('mid');
  });

  it('מפענח תווים מקודדים', () => {
    expect(authCodeFrom('com.eretzir.go://auth?code=a%2Fb')).toBe('a/b');
  });

  /**
   * קישור עמוק אחר לגמרי הוא מצב תקין — למשל שיתוף. הוא לא אמור
   * להיחשב כניסיון התחברות ובוודאי לא להפיל את האפליקציה.
   */
  it('קישור בלי קוד מחזיר null ולא זורק', () => {
    expect(authCodeFrom('com.eretzir.go://share?word=מצדה')).toBeNull();
    expect(authCodeFrom('')).toBeNull();
    expect(authCodeFrom('not a url at all')).toBeNull();
  });

  it('לא מתבלבל בין code לפרמטר אחר שמסתיים ב-code', () => {
    expect(authCodeFrom('com.eretzir.go://auth?zipcode=12345')).toBeNull();
  });
});

describe('חיווט המאזין', () => {
  it('המאזין מותקן באפליקציה, ולא עושה כלום בדפדפן', () => {
    const lib = readFileSync(resolve(root, 'src/lib/supabase.ts'), 'utf8');
    expect(lib).toContain("if (!isNative()) return () => undefined;");
    expect(lib).toContain("App.addListener('appUrlOpen'");

    const app = readFileSync(resolve(root, 'src/App.tsx'), 'utf8');
    expect(app).toContain('listenForAuthDeepLink');
  });
});
