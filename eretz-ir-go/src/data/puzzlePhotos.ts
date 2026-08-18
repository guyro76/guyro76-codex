/**
 * צילומים אמיתיים של אתרי הפאזל, ארוזים בתוך החבילה.
 *
 * למה בכלל לארוז ולא רק למשוך מהרשת: המשחק הוא Offline First. הצינור
 * החי מוויקיפדיה עובד מצוין, אבל בצפייה הראשונה **בלי רשת** הוא לא
 * מחזיר כלום, והילד רואה איור במקום צילום. קובץ ארוז נפתח מיד, תמיד.
 *
 * מאיפה הקבצים: הם אינם נכתבים ביד. `scripts/fetch-puzzle-photos.mjs`
 * מושך אותם מוויקיפדיה העברית יחד עם שם היוצר, הרישיון והקישור לדף
 * המקור, ומייצר את הקובץ הזה מחדש. הסקריפט רץ ב-GitHub Actions, כי שם
 * יש גישה לשרתי ויקימדיה.
 *
 * הכלל שלא נשבר: **אין כאן תמונה שמקורה לא ידוע.** לכל רשומה יש יוצר,
 * רישיון וקישור לדף התיאור — ושלושתם מוצגים לילד לצד התמונה. תמונה
 * שהסקריפט לא הצליח לאמת פשוט לא נכנסת, והפאזל שלה נופל חזרה לצינור
 * החי ואז לאיור.
 */
export interface PuzzlePhoto {
  /** שם הקובץ בתוך public/puzzles */
  file: string;
  /** היוצר, כפי שוויקישיתוף מדווח עליו */
  author: string;
  /** שם הרישיון, למשל "CC BY-SA 4.0" */
  license: string;
  /** דף התיאור בוויקישיתוף — שם אפשר לאמת הכול */
  pageUrl: string;
}

/**
 * מפתח = מזהה הפאזל. נוצר אוטומטית; אין לערוך ביד.
 *
 * ריק עד שהסקריפט רץ בפעם הראשונה. ריק זה מצב תקין ולא שבור: כל
 * הפאזלים פשוט משתמשים בצינור החי ובאיור, בדיוק כמו קודם.
 */
export const PUZZLE_PHOTOS: Record<string, PuzzlePhoto> = {};

export function puzzlePhoto(puzzleId: string): PuzzlePhoto | undefined {
  return PUZZLE_PHOTOS[puzzleId];
}

/**
 * הנתיב הציבורי לצילום.
 *
 * נגזר מ-`BASE_URL` ולא קבוע: ב-GitHub Pages האתר יושב תחת תת-נתיב,
 * ונתיב מוחלט היה שובר שם את כל התמונות.
 */
export function puzzlePhotoUrl(photo: PuzzlePhoto): string {
  return `${import.meta.env.BASE_URL}puzzles/${photo.file}`;
}

/** הקרדיט כפי שהוא מוצג לילד מתחת לתמונה */
export function puzzlePhotoCredit(photo: PuzzlePhoto): string {
  return `${photo.author} · ${photo.license}`;
}
