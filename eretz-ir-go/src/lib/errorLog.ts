import { getSetting, setSetting, db } from '../db/db';

/**
 * יומן תקלות מקומי.
 *
 * ## למה זה קיים
 *
 * `ErrorBoundary` מציג מסך נחמד ומאפשר טעינה מחדש — אבל לא שומר
 * כלום, ולכן תקלה שקרתה אצל ילד אחד פשוט נעלמת. Play Console
 * מדווח קריסות בחינם, אבל **שגיאת JavaScript ב-WebView אינה
 * קריסה נייטיבית** ולכן לא תופיע שם לעולם. בלי זה אין שום דרך
 * לדעת מה נשבר.
 *
 * ## למה מקומי בלבד
 *
 * שירות דיווח תקלות חיצוני עולה כסף מעל מכסה, ומעביר מידע על
 * הילד לצד שלישי. שניהם אסורים כאן. השגיאה נשמרת **במכשיר**,
 * מוצגת באזור ההורים, וההורה מחליט אם לשלוח אותה — בהעתקה ידנית.
 * שום דבר לא יוצא לבד.
 *
 * ## מה לא נשמר
 *
 * רק סוג השגיאה, ההודעה ומאיזה מסך היא הגיעה. **לא** תשובות של
 * הילד, לא שמות, ולא תוכן המשחק.
 */

const KEY = 'lastError';

/** אורך מרבי להודעה. שגיאה עם stack ארוך תופסת מקום ולא מוסיפה מידע. */
const MAX_MESSAGE = 400;

export interface StoredError {
  /** מתי, בזמן מקומי */
  at: string;
  /** ההודעה עצמה, מקוצצת */
  message: string;
  /** באיזה מסך היינו */
  screen?: string;
}

/**
 * מנקה את ההודעה ממה שאסור לשמור.
 *
 * שגיאה יכולה להכיל טקסט שהילד הקליד (למשל "התשובה 'כלב' נדחתה"),
 * ולכן מוסרים מרכאות ותוכן שביניהן לפני השמירה. עדיף הודעה פחות
 * מדויקת מאשר תשובה של ילד ביומן.
 */
export function sanitizeMessage(raw: string): string {
  return raw
    .replace(/["'”“][^"'”“]{0,80}["'”“]/g, '"…"')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_MESSAGE);
}

export async function recordError(err: unknown, screen?: string): Promise<void> {
  try {
    const message = sanitizeMessage(
      err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    );
    if (!message) return;
    await setSetting(KEY, JSON.stringify({ at: new Date().toISOString(), message, screen }));
  } catch {
    /* אם גם השמירה נכשלת — לא מפילים את האפליקציה בגלל יומן */
  }
}

export async function lastError(): Promise<StoredError | null> {
  try {
    const raw = await getSetting(KEY);
    return raw ? (JSON.parse(raw) as StoredError) : null;
  } catch {
    return null;
  }
}

export async function clearError(): Promise<void> {
  try {
    await db.settings.delete(KEY);
  } catch {
    /* אין מה לעשות, ואין למי לדווח */
  }
}

/**
 * מלכודת גלובלית לשגיאות שלא נתפסות ב-`ErrorBoundary`.
 *
 * `ErrorBoundary` של React תופס רק שגיאות שקורות בזמן רינדור.
 * שגיאה בתוך `setTimeout`, ב-`fetch` או ב-Promise שנדחה עוברת
 * לידו — וזה בדיוק סוג התקלות שקשה לשחזר.
 */
export function installErrorTrap(currentScreen: () => string): () => void {
  const onError = (e: ErrorEvent) => void recordError(e.error ?? e.message, currentScreen());
  const onRejection = (e: PromiseRejectionEvent) => void recordError(e.reason, currentScreen());
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);
  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
  };
}
