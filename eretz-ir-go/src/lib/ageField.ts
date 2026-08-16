/**
 * שדה הגיל.
 *
 * הבאג שדווח מהשטח: מקלידים "1" ומקבלים "51".
 *
 * הסיבה: הערך נצמד לתחום החוקי בכל הקלדה בודדת. מי שמחק את השדה
 * וניסה להקליד 12 קיבל אחרי התו הראשון `max(5, 1)` = 5, השדה נכתב
 * מחדש כ-"5", והתו הבא הצטרף אליו — "51". השדה למעשה נלחם במשתמש.
 *
 * הפתרון: בזמן ההקלדה שומרים את מה שהוקלד כמות שהוא, ומצמידים
 * לתחום רק כשמסיימים. זה הכלל הכללי לשדות מספריים — אימות בסיום,
 * לא באמצע.
 */

export const MIN_AGE = 4;
export const MAX_AGE = 99;
export const DEFAULT_AGE = 11;

/** מה מותר להישאר בשדה בזמן הקלדה: ספרות בלבד, ולכל היותר שתיים */
export function sanitizeAgeInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 2);
}

/** הצמדה לתחום — נקראת ביציאה מהשדה ובשמירה, לא בכל תו */
export function clampAge(raw: string, fallback = DEFAULT_AGE): number {
  const n = Number(raw);
  if (!raw.trim() || Number.isNaN(n)) return fallback;
  return Math.min(MAX_AGE, Math.max(MIN_AGE, Math.round(n)));
}
