import { getSetting, setSetting } from '../db/db';

/**
 * זיכרון של אותיות שהוגרלו לאחרונה.
 *
 * הצורך דווח מהשטח: "אם כבר עשיתי את האות, רצוי שהיא לא תחזור שוב".
 * במשחק רב-סיבובי המצב נשמר ממילא, אבל במצבים הקצרים — ראש בראש
 * ושרשרת — כל הגרלה התחילה מאפס, ולכן אותה אות חזרה שוב ושוב.
 *
 * הזיכרון קצר בכוונה. חוסמים את האחרונות בלבד ולא את כל מה שהיה אי
 * פעם, אחרת אחרי עשרים משחקים פשוט ייגמרו האותיות והמשחק ייתקע.
 */

const KEY = 'recent-letters';

/**
 * כמה אותיות זוכרים. עשרים ושתיים אותיות משחק, ולכן שמונה זה בערך
 * שליש — מספיק כדי שלא תרגיש חזרתיות, ורחוק מספיק מלחסום את המאגר.
 */
export const MEMORY = 8;

/** חיתוך לזיכרון הקצר. הפונקציה טהורה כדי שאפשר יהיה לבדוק אותה */
export function remember(recent: string[], letter: string, max = MEMORY): string[] {
  return [letter, ...recent.filter((l) => l !== letter)].slice(0, max);
}

/**
 * כמה אותיות באמת לחסום.
 *
 * לעולם לא חוסמים יותר ממחצית מהמאגר הזמין: אם נחסום כמעט הכול,
 * ההגרלה תיפול חזרה על "אין מועמדים" ותחזיר אות אקראית לגמרי —
 * כלומר בדיוק ההפך ממה שרצינו.
 */
export function blockList(recent: string[], poolSize: number): string[] {
  const cap = Math.max(0, Math.floor(poolSize / 2));
  return recent.slice(0, cap);
}

export async function loadRecent(): Promise<string[]> {
  const raw = await getSetting(KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((l): l is string => typeof l === 'string') : [];
  } catch {
    return [];
  }
}

export async function pushRecent(letter: string): Promise<string[]> {
  const next = remember(await loadRecent(), letter);
  await setSetting(KEY, JSON.stringify(next));
  return next;
}
