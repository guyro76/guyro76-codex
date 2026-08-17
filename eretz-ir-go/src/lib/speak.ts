import { getSetting } from '../db/db';
import { getAudioMode, onAudioModeChange } from './sound';

/**
 * הקראה בקול של טקסט המשחק — לילדים שעדיין לא קוראים.
 *
 * למה זה כאן: המשחק מבקש מהילד לקרוא שם קטגוריה ואות. ילד בן חמש
 * יודע לשחק ארץ-עיר בעל פה מזמן לפני שהוא יודע לקרוא "אישיות
 * מפורסמת". בלי הקראה הוא תלוי במבוגר שיקריא לו, ועם הקראה הוא
 * משחק לבד.
 *
 * ההקראה נעשית ב-SpeechSynthesis של הדפדפן — קול שמותקן במכשיר
 * עצמו. אין כאן שירות AI, אין מפתח, אין עלות לפי טוקנים ואין
 * שליחה של שום דבר החוצה.
 *
 * גבול שאסור לחצות: מוקראים רק טקסטים קבועים של המשחק — שמות
 * קטגוריות, אותיות, הוראות. **תשובות שהילד כתב לא מוקראות לעולם**,
 * כי הקראה של קלט חופשי הופכת כל טעות הקלדה למשהו שנאמר בקול
 * ברמקול. יש על זה בדיקה אוטומטית.
 */

/** שמות האותיות, כדי שהמכשיר יגיד "אָלֶף" ולא ינסה להגות תו בודד */
const LETTER_NAMES: Record<string, string> = {
  א: 'אלף',
  ב: 'בית',
  ג: 'גימל',
  ד: 'דלת',
  ה: 'הא',
  ו: 'ואו',
  ז: 'זין',
  ח: 'חית',
  ט: 'טית',
  י: 'יוד',
  כ: 'כף',
  ל: 'למד',
  מ: 'מם',
  נ: 'נון',
  ס: 'סמך',
  ע: 'עין',
  פ: 'פא',
  צ: 'צדי',
  ק: 'קוף',
  ר: 'ריש',
  ש: 'שין',
  ת: 'תו'
};

/** האם המכשיר בכלל יודע להקריא */
export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * כבוי כברירת מחדל: הקראה היא בחירה מודעת של הורה, לא הפתעה
 * קולית בפעם הראשונה שפותחים את המשחק.
 */
let on = false;
const listeners = new Set<(v: boolean) => void>();

void (async () => {
  if ((await getSetting('read-aloud')) === '1') {
    on = true;
    for (const fn of listeners) fn(true);
  }
})();

export function readAloudOn(): boolean {
  return on;
}

export function onReadAloudChange(fn: (v: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setReadAloud(next: boolean): void {
  on = next;
  if (!next) stopSpeaking();
  for (const fn of listeners) fn(next);
}

/**
 * בחירת קול עברי.
 *
 * בכרום רשימת הקולות מגיעה אסינכרונית ובקריאה הראשונה היא ריקה,
 * ולכן שואלים אותה מחדש בכל הקראה במקום לשמור אותה פעם אחת.
 * אם אין קול עברי מותקן — עדיין מבקשים he-IL ונותנים למכשיר
 * לבחור את הקרוב ביותר, וזה עדיף על שתיקה.
 */
function hebrewVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang === 'he-IL') ?? voices.find((v) => v.lang.startsWith('he'));
}

/** טקסט ההקראה של אות בודדת */
export function letterSpeech(letter: string): string {
  return LETTER_NAMES[letter] ?? letter;
}

/**
 * הקראה. מתעלמת בשקט כשההקראה כבויה, כשהמכשיר בהשתקה מלאה
 * (audio mode = none) או כשאין תמיכה — כדי שקריאה מהמסך לא תצטרך
 * לבדוק שלושה תנאים בכל מקום.
 */
export function speak(text: string): void {
  if (!on || !canSpeak() || getAudioMode() === 'none') return;
  const trimmed = text.trim();
  if (!trimmed) return;

  // הקראה חדשה מבטלת את הקודמת: ילד שמדלג בין קטגוריות לא צריך
  // לחכות שהתור יתנגן עד הסוף
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(trimmed);
  utter.lang = 'he-IL';
  const voice = hebrewVoice();
  if (voice) utter.voice = voice;
  // איטי במעט מהרגיל: זה נועד למי שרק לומד לקרוא
  utter.rate = 0.9;
  utter.pitch = 1.05;
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}

/**
 * "השתקה מלאה" חייבת להשתיק גם את ההקראה, ומיד — לא רק את ההקראה
 * הבאה. מי שלוחץ השתקה באמצע משפט מצפה לשקט עכשיו.
 */
onAudioModeChange((m) => {
  if (m === 'none') stopSpeaking();
});
