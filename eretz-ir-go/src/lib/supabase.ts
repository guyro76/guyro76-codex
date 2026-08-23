import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';

/**
 * חיבור ל-Supabase.
 *
 * המפתח שנמצא כאן הוא ה-anon key, שנועד מלכתחילה לרוץ בצד לקוח —
 * ההגנה האמיתית היא Row Level Security במסד הנתונים, לא סודיות
 * המפתח. מפתח ה-service_role לעולם לא מגיע לקוד הזה.
 *
 * אם משתני הסביבה חסרים, האפליקציה ממשיכה לעבוד במצב מקומי מלא —
 * המשחק עצמו מעולם לא היה תלוי בענן, וזה לא משתנה.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export function authConfigured(): boolean {
  return Boolean(url && anonKey);
}

let client: SupabaseClient | null = null;

const REMEMBER_KEY = 'eretz-ir-go-remember';

/** האם המשתמש ביקש שיזכרו אותו. ברירת המחדל: כן. */
export function isRemembered(): boolean {
  try {
    return localStorage.getItem(REMEMBER_KEY) !== '0';
  } catch {
    return true;
  }
}

export function setRemembered(value: boolean): void {
  try {
    localStorage.setItem(REMEMBER_KEY, value ? '1' : '0');
  } catch {
    /* דפדפן שחוסם אחסון — פשוט לא זוכרים */
  }
}

/**
 * אחסון הסשן, נבחר לפי "זכור אותי".
 *
 * מי שסימן — הסשן נשמר ב-localStorage ושורד סגירת דפדפן, כך שבפעם
 * הבאה נכנסים ישר למשחק. מי שלא סימן (למשל על מחשב משותף) מקבל
 * sessionStorage: ברגע שהלשונית נסגרת ההתחברות נעלמת.
 */
const sessionAwareStorage = {
  getItem: (key: string) => {
    try {
      return (isRemembered() ? localStorage : sessionStorage).getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      (isRemembered() ? localStorage : sessionStorage).setItem(key, value);
    } catch {
      /* ignore */
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
};

export function supabase(): SupabaseClient | null {
  if (!authConfigured()) return null;
  client ??= createClient(url!, anonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'eretz-ir-go-auth',
      storage: sessionAwareStorage
    }
  });
  return client;
}

/**
 * אילו שיטות התחברות באמת פעילות בשרת.
 *
 * בלי הבדיקה הזו כפתור "להיכנס עם Google" מוביל למבוי סתום כשהספק
 * עוד לא הוגדר. עדיף לא להציג כפתור מאשר להציג כפתור שנכשל.
 */
export async function availableProviders(): Promise<{ google: boolean; apple: boolean }> {
  if (!authConfigured()) return { google: false, apple: false };
  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: anonKey! },
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) return { google: false, apple: false };
    const data = (await res.json()) as { external?: Record<string, boolean> };
    return { google: Boolean(data.external?.google), apple: Boolean(data.external?.apple) };
  } catch {
    return { google: false, apple: false };
  }
}

/**
 * כתובת החזרה באפליקציה עטופה.
 *
 * הסכמה הזו נרשמת אוטומטית על ידי Capacitor לפי מזהה האפליקציה
 * (`custom_url_scheme` ב-strings.xml), ולכן היא חייבת להישאר זהה
 * למזהה — יש בדיקה שנועלת את זה.
 */
export const NATIVE_REDIRECT = 'com.eretzir.go://auth';

/** האם רצים בתוך אפליקציה עטופה ולא בדפדפן */
export function isNative(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * בוחר את כתובת החזרה מההתחברות.
 *
 * מופרד מ-`redirectTo` כפונקציה טהורה כדי שאפשר יהיה לבדוק אותו:
 * המסלול הנייטיבי לא ניתן להרצה כאן, והדרך היחידה לוודא שהוא לא
 * שובר את המסלול של הדפדפן היא לבדוק את ההחלטה עצמה.
 */
export function pickRedirect(native: boolean, origin: string, pathname: string): string {
  return native ? NATIVE_REDIRECT : `${origin}${pathname}`;
}

/**
 * לאן חוזרים אחרי התחברות דרך ספק חיצוני.
 *
 * בדפדפן זו הכתובת הנוכחית. באפליקציה עטופה **אי אפשר** להשתמש בה:
 * שם `window.location.origin` הוא `https://localhost`, ו-Supabase לא
 * יכול להחזיר לשם — המשתמש היה נתקע בדפדפן שנפתח ולא חוזר למשחק.
 * לכן שם חוזרים דרך סכמת ה-URL של האפליקציה.
 *
 * שימו לב: הכתובת הזו חייבת להיות רשומה גם ב-Supabase תחת
 * Authentication ← URL Configuration ← Redirect URLs, אחרת הספק
 * ידחה אותה.
 */
export function redirectTo(): string {
  return pickRedirect(isNative(), window.location.origin, window.location.pathname);
}

/**
 * תוצאת מחיקת חשבון.
 *
 * `local-only` הוא מצב תקין ולא שגיאה: בבנייה בלי Supabase אין חשבון
 * בשרת מלכתחילה, ויש רק מידע במכשיר. המסך צריך לומר את זה לילד
 * ולהורה בבירור, ולא להציג כשל.
 */
export type DeleteAccountResult = 'deleted' | 'local-only' | 'not-signed-in' | 'failed';

/**
 * מוחק את חשבון המשתמש בשרת.
 *
 * הקריאה עוברת דרך פונקציית Edge, כי מחיקת משתמש דורשת מפתח service
 * role — ומפתח כזה לא ייכנס לקוד צד לקוח לעולם. מכאן נשלח רק ה-JWT
 * של המשתמש עצמו, והשרת גוזר ממנו את הזהות. לכן אי אפשר למחוק דרך
 * הקריאה הזו חשבון של מישהו אחר, גם לא בכוונה.
 *
 * המחיקה המקומית **לא** נעשית כאן. היא נפרדת בכוונה: מחיקת המכשיר
 * צריכה לקרות גם כשאין חשבון בכלל, וגם אם השרת נכשל.
 */
export async function deleteAccount(): Promise<DeleteAccountResult> {
  if (!authConfigured()) return 'local-only';
  const sb = supabase();
  if (!sb) return 'local-only';

  const { data } = await sb.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return 'not-signed-in';

  try {
    const res = await fetch(`${url}/functions/v1/delete-account`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: anonKey!,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) return 'failed';
    return 'deleted';
  } catch {
    return 'failed';
  }
}

/**
 * משלים את ההתחברות כשהאפליקציה נפתחת מחדש דרך הקישור העמוק.
 *
 * בדפדפן supabase-js עושה את זה לבד (`detectSessionInUrl`), כי
 * הכתובת פשוט נטענת. באפליקציה עטופה הספק מחזיר לסכמת ה-URL של
 * האפליקציה — האפליקציה מתעוררת עם כתובת ביד, ואף אחד לא קורא
 * אותה אלא אם מאזינים. בלי המאזין הזה ההתחברות נראית כאילו היא
 * "לא עשתה כלום".
 *
 * מחזיר פונקציית ניקוי, ולא עושה כלום בדפדפן.
 */
export async function listenForAuthDeepLink(): Promise<() => void> {
  if (!isNative()) return () => undefined;
  const sb = supabase();
  if (!sb) return () => undefined;

  const { App } = await import('@capacitor/app');
  const handle = await App.addListener('appUrlOpen', ({ url }) => {
    void completeAuthFromUrl(url);
  });
  return () => void handle.remove();
}

/**
 * מוציא את קוד ההתחברות מהכתובת ומחליף אותו בסשן.
 *
 * מיוצא בנפרד כדי שיהיה אפשר לבדוק את חילוץ הקוד בלי אפליקציה
 * נייטיבית. מחזיר false כשאין בכתובת קוד — למשל קישור עמוק אחר
 * לגמרי, שאסור לו להפיל את האפליקציה.
 */
export async function completeAuthFromUrl(url: string): Promise<boolean> {
  const code = authCodeFrom(url);
  if (!code) return false;
  const sb = supabase();
  if (!sb) return false;
  const { error } = await sb.auth.exchangeCodeForSession(code);
  return !error;
}

/** קוד ההתחברות מתוך כתובת חזרה, או null אם אין */
export function authCodeFrom(url: string): string | null {
  try {
    // `URL` לא מפרסר סכמות מותאמות באופן אחיד בכל הדפדפנים, ולכן
    // הקוד נשלף מהמחרוזת עצמה — גם מה-query וגם מה-fragment.
    const match = /[?&#]code=([^&#]+)/.exec(url);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}
