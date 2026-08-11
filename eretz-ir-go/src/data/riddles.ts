/**
 * חידות להחלפת אות.
 *
 * זו הדרך של מי שאין לו קרדיט: תמיד קיים מסלול שלא דורש כלום חוץ
 * מלחשוב, כדי שילד שעוד לא צבר לא ייתקע מול אות בלתי אפשרית.
 *
 * החידות קלות בכוונה — המטרה היא רגע של חיוך, לא מבחן. כל חידה
 * מקבלת כמה ניסוחים תקינים של התשובה, כי ילד כותב "שמש" ולא
 * "השמש", ולפעמים עם שגיאת כתיב קטנה.
 */
export interface Riddle {
  id: string;
  question: string;
  /** התשובה הראשונה היא זו שמוצגת אם מוותרים */
  answers: string[];
}

export const RIDDLES: Riddle[] = [
  { id: 'shadow', question: 'מה הולך אחריך לכל מקום, אבל נעלם בחושך?', answers: ['צל', 'הצל'] },
  { id: 'sun', question: 'עולה בבוקר, שוקע בערב, ומחמם את כולם. מי אני?', answers: ['שמש', 'השמש'] },
  { id: 'egg', question: 'לבן מבחוץ, צהוב מבפנים, ונשבר בקלות. מה זה?', answers: ['ביצה', 'ביצת'] },
  { id: 'clock', question: 'יש לו שני מחוגים אבל אין לו ידיים. מה זה?', answers: ['שעון', 'השעון'] },
  { id: 'rain', question: 'יורד מלמעלה, לא נופל ולא נשבר. מה זה?', answers: ['גשם', 'הגשם'] },
  { id: 'book', question: 'יש לו דפים אבל הוא לא עץ. מה זה?', answers: ['ספר', 'הספר'] },
  { id: 'candle', question: 'ככל שהוא חי יותר זמן, כך הוא נעשה קצר יותר. מה זה?', answers: ['נר', 'הנר'] },
  { id: 'river', question: 'יש לו מיטה אבל הוא אף פעם לא ישן. מה זה?', answers: ['נהר', 'הנהר'] },
  { id: 'needle', question: 'יש לו עין אחת ואינו רואה כלום. מה זה?', answers: ['מחט', 'המחט'] },
  { id: 'corn', question: 'יש לו שיניים אבל הוא לא נושך. מה זה?', answers: ['מסרק', 'המסרק'] },
  { id: 'map', question: 'יש בה ערים בלי בתים והרים בלי אבנים. מה זה?', answers: ['מפה', 'המפה'] },
  { id: 'echo', question: 'מדבר בלי פה ושומע בלי אוזניים. מה זה?', answers: ['הד', 'ההד'] },
  { id: 'wind', question: 'אי אפשר לראות אותו אבל מרגישים אותו על הפנים. מה זה?', answers: ['רוח', 'הרוח'] },
  { id: 'letters', question: 'כמה אותיות יש באלף-בית העברי?', answers: ['22', 'עשרים ושתיים', 'עשרים ושתים'] },
  { id: 'week', question: 'כמה ימים יש בשבוע?', answers: ['7', 'שבעה', 'שבע'] },
  { id: 'rainbow', question: 'מופיעה אחרי הגשם וצבעונית מאוד. מה זה?', answers: ['קשת', 'הקשת', 'קשת בענן'] },
  { id: 'piano', question: 'יש לו קלידים שחורים ולבנים והוא משמיע מוזיקה. מה זה?', answers: ['פסנתר', 'הפסנתר'] },
  { id: 'shoe', question: 'יש לו לשון אבל הוא לא מדבר, ויש לו עקב. מה זה?', answers: ['נעל', 'הנעל'] }
];

/** ניקוי תשובה להשוואה: בלי רווחים מיותרים, בלי סימני פיסוק ובלי "ה" הידיעה */
function normalize(text: string): string {
  return text
    .trim()
    .replace(/[.,!?׳"'־-]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export function isRiddleAnswerCorrect(riddle: Riddle, guess: string): boolean {
  const g = normalize(guess);
  if (!g) return false;
  return riddle.answers.some((a) => {
    const n = normalize(a);
    // מקבלים גם את הצורה בלי "ה" הידיעה, לשני הכיוונים
    return n === g || `ה${n}` === g || n === `ה${g}`;
  });
}

/** חידה אקראית שאינה אחת מאלה שכבר הוצגו במשחק הזה */
export function pickRiddle(usedIds: string[]): Riddle {
  const fresh = RIDDLES.filter((r) => !usedIds.includes(r.id));
  const pool = fresh.length > 0 ? fresh : RIDDLES;
  return pool[Math.floor(Math.random() * pool.length)];
}
