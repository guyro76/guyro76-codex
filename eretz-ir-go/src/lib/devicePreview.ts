/**
 * המידות והחישוב של התצוגה המקדימה במכשירים (מסך הניהול).
 *
 * זה יושב בנפרד מהרכיב כדי שיהיה אפשר לבדוק את החישוב: טעות בקנה
 * המידה לא נראית בקוד, היא נראית רק כשמסגרת בורחת מהמסך אצל מנהל
 * שמסתכל בטלפון.
 */
export interface Device {
  id: string;
  name: string;
  icon: string;
  width: number;
  height: number;
}

/** רוחבים אמיתיים ונפוצים, ולא מספרים עגולים לשם היופי */
export const DEVICES: Device[] = [
  { id: 'phone', name: 'טלפון', icon: '📱', width: 390, height: 780 },
  { id: 'tablet', name: 'טאבלט', icon: '📋', width: 820, height: 1024 },
  { id: 'laptop', name: 'מחשב נייד', icon: '💻', width: 1440, height: 820 }
];

/** רוחב מרבי שהכרטיס נותן למסגרת, גם על מסך ענק */
export const MAX_FRAME_WIDTH = 820;

/**
 * הרוחב שנשאר לתצוגה בתוך הכרטיס: רוחב החלון פחות הריפוד משני
 * הצדדים, ולא יותר מהרוחב המרבי של הכרטיס עצמו.
 */
export function availableWidth(windowWidth: number): number {
  return Math.max(200, Math.min(windowWidth - 64, MAX_FRAME_WIDTH));
}

/**
 * קנה המידה להצגת מכשיר ברוחב הזמין.
 *
 * לעולם לא מעל 1: מכשיר צר מהחלון מוצג בגודלו האמיתי ולא מנופח,
 * אחרת התצוגה "המדויקת" הייתה משקרת בדיוק בדבר שבודקים בה.
 */
export function previewScale(device: Device, windowWidth: number): number {
  return Math.min(1, availableWidth(windowWidth) / device.width);
}
