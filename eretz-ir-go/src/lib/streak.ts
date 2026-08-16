import { todayKey } from './daily';

/**
 * רצף ימי משחק.
 *
 * הרעיון פשוט ומכוון: ילד שחוזר מחר שומר על הרצף. אין כאן עונש —
 * רצף שנקטע פשוט מתחיל מאחד, בלי הודעה דרמטית ובלי לאבד שום דבר
 * שנצבר. מטבעות והישגים לא נמחקים לעולם.
 *
 * **ארכת חסד של יום אחד**: מי ששיחק אתמול ועוד לא היום נחשב ברצף
 * פעיל. בלי זה, ילד שנכנס בבוקר היה רואה "0" ומרגיש שהפסיד משהו
 * לפני שבכלל התחיל לשחק.
 *
 * החישוב עובד על מפתחות תאריך **מקומיים** ולא על UTC. משחק בשמונה
 * בערב בישראל הוא כבר "מחר" ב-UTC, ורצף שנשבר בגלל אזור זמן הוא
 * באג שקשה מאוד לשחזר.
 */

export interface StreakInfo {
  /** אורך הרצף הנוכחי בימים */
  current: number;
  /** הרצף הארוך ביותר אי פעם */
  longest: number;
  /** האם כבר שיחקו היום */
  playedToday: boolean;
  /** נשאר ברצף אבל עוד לא שיחקו היום — הרגע שבו כדאי לעודד */
  atRisk: boolean;
}

/** תאריך מקומי בפורמט YYYY-MM-DD מתוך חותמת זמן ISO */
export function localDateKey(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : todayKey(d);
}

/** מספר הימים בין שני מפתחות תאריך. חסין למעברי שעון קיץ */
export function daysBetween(earlier: string, later: string): number {
  const [y1, m1, d1] = earlier.split('-').map(Number);
  const [y2, m2, d2] = later.split('-').map(Number);
  const a = Date.UTC(y1, m1 - 1, d1);
  const b = Date.UTC(y2, m2 - 1, d2);
  return Math.round((b - a) / 86_400_000);
}

/**
 * מחשבת רצף מתוך רשימת חותמות זמן של משחקים.
 * הרשימה יכולה להגיע בכל סדר ועם כפילויות — כמה משחקים באותו יום
 * נספרים כיום אחד.
 */
export function computeStreak(timestamps: string[], today: string = todayKey()): StreakInfo {
  const days = [...new Set(timestamps.map(localDateKey).filter(Boolean))].sort();
  if (days.length === 0) {
    return { current: 0, longest: 0, playedToday: false, atRisk: false };
  }

  // הרצף הארוך ביותר אי פעם
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = daysBetween(days[i - 1], days[i]) === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  const last = days[days.length - 1];
  const gap = daysBetween(last, today);
  const playedToday = gap === 0;

  // רצף חי רק אם המשחק האחרון היה היום או אתמול
  if (gap > 1 || gap < 0) {
    return { current: 0, longest, playedToday: false, atRisk: false };
  }

  let current = 1;
  for (let i = days.length - 1; i > 0; i--) {
    if (daysBetween(days[i - 1], days[i]) === 1) current++;
    else break;
  }

  return { current, longest, playedToday, atRisk: !playedToday };
}

/** נוסח קצר לילדים. השפה מעודדת תמיד — גם ביום הראשון */
export function streakLabel(info: StreakInfo): string {
  if (info.current === 0) return 'מתחילים רצף חדש היום!';
  if (info.atRisk) return `הרצף שלכם: ${info.current} — משחק אחד היום ושומרים עליו!`;
  if (info.current === 1) return 'התחלתם רצף! נתראה מחר 🔥';
  return `${info.current} ימים ברצף! 🔥`;
}
