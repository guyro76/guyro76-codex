import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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

export function supabase(): SupabaseClient | null {
  if (!authConfigured()) return null;
  client ??= createClient(url!, anonKey!, {
    auth: {
      // "שיזכור אותי בכניסה הבאה" — הסשן נשמר ומתחדש מעצמו,
      // כך שמי שהתחבר פעם אחת נכנס ישר למשחק בפעם הבאה.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'eretz-ir-go-auth'
    }
  });
  return client;
}

/** לאן חוזרים אחרי התחברות דרך ספק חיצוני */
export function redirectTo(): string {
  return `${window.location.origin}${window.location.pathname}`;
}
