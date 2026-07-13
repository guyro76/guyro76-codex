/**
 * כלי נרמול עברית — הלב של מנוע בדיקת התשובות.
 * כל ההשוואות במשחק נעשות על הצורה המנורמלת, אך הצורה המקורית
 * שהמשתמש הקליד נשמרת ומוצגת תמיד כפי שהיא.
 */

/** אותיות סופיות -> אותיות רגילות (לצורך השוואה בלבד) */
const FINAL_TO_REGULAR: Record<string, string> = {
  'ך': 'כ',
  'ם': 'מ',
  'ן': 'נ',
  'ף': 'פ',
  'ץ': 'צ'
};

/** האותיות שמהן מגרילים — ללא אותיות סופיות */
export const GAME_LETTERS = [
  'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ',
  'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'
] as const;

export type GameLetter = (typeof GAME_LETTERS)[number];

/** הסרת ניקוד וטעמים */
export function stripNiqqud(text: string): string {
  return text.replace(/[֑-ׇ]/g, '');
}

/** המרת אותיות סופיות לרגילות */
export function unfinalize(text: string): string {
  return text.replace(/[ךםןףץ]/g, (ch) => FINAL_TO_REGULAR[ch] ?? ch);
}

/**
 * נרמול מלא לצורך השוואה:
 * ניקוד, גרשיים ("צ'יפס" / "צ׳יפס"), מקפים, רווחים כפולים,
 * סימני פיסוק ואותיות סופיות.
 */
export function normalizeHebrew(raw: string): string {
  let s = stripNiqqud(raw.trim());
  // גרש/גרשיים טיפוגרפיים -> ASCII אחיד
  s = s.replace(/[׳‘’`]/g, "'").replace(/[״“”]/g, '"');
  // מקפים לסוגיהם -> רווח (כדי ש"תל-אביב" ו"תל אביב" יהיו שקולים)
  s = s.replace(/[-‐-―־]/g, ' ');
  // סימני פיסוק שאינם חלק מהמילה
  s = s.replace(/[.,!?;:()\[\]{}״]/g, '');
  // רווחים כפולים
  s = s.replace(/\s+/g, ' ').trim();
  s = unfinalize(s);
  return s.toLowerCase(); // עבור אותיות לועזיות בקטגוריות שמתירות אותן
}

/** המילים ה"קטנות" שמדלגים עליהן כשבודקים את האות הראשונה של שם רב-מילי */
const SKIP_PREFIX_WORDS = new Set(['של', 'את', 'עם', 'על']);

/**
 * המילה המשמעותית הראשונה בתשובה.
 * אם allowHeHaydia=true, מותר להתעלם מה"א הידיעה בתחילת המילה
 * (שימושי לשמות סרטים: "הפרח של אמא" נחשב מתחיל ב-פ).
 */
export function firstSignificantWord(normalized: string, allowHeHaydia: boolean): string {
  const words = normalized.split(' ').filter((w) => w.length > 0 && !SKIP_PREFIX_WORDS.has(w));
  if (words.length === 0) return '';
  let word = words[0];
  if (allowHeHaydia && word.length > 2 && word.startsWith('ה')) {
    return word; // מוחזרת כמו שהיא — הבדיקה תיעשה גם עם וגם בלי ה' (ראו startsWithLetter)
  }
  return word;
}

/**
 * האם התשובה מתחילה באות הנדרשת.
 * בתשובה רב-מילית נבדקת המילה המשמעותית הראשונה.
 * אם מותרת ה"א הידיעה — "החתול" נחשב מתחיל גם ב-ה' וגם ב-ח'.
 */
export function startsWithLetter(raw: string, letter: string, opts?: { allowHeHaydia?: boolean }): boolean {
  const allowHe = opts?.allowHeHaydia ?? true;
  const normLetter = unfinalize(stripNiqqud(letter));
  const word = firstSignificantWord(normalizeHebrew(raw), allowHe);
  if (!word) return false;
  if (word.startsWith(normLetter)) return true;
  if (allowHe && word.length > 2 && word.startsWith('ה') && word.slice(1).startsWith(normLetter)) {
    return true;
  }
  return false;
}

/** וריאציות כתיב מלא/חסר בסיסיות: מסירים יו"ד/וי"ו עיצוריות כפולות */
export function spellingVariants(normalized: string): string[] {
  const variants = new Set<string>([normalized]);
  variants.add(normalized.replace(/יי/g, 'י'));
  variants.add(normalized.replace(/וו/g, 'ו'));
  variants.add(normalized.replace(/יי/g, 'י').replace(/וו/g, 'ו'));
  // הסרת ה"א הידיעה כווריאציה
  if (normalized.length > 3 && normalized.startsWith('ה')) {
    variants.add(normalized.slice(1));
  }
  return [...variants];
}

/** האם המחרוזת נראית כמו ג'יבריש — רצף ללא תנועה הגיונית או תו חוזר */
export function looksLikeGibberish(raw: string): boolean {
  const s = normalizeHebrew(raw);
  if (s.length < 2) return true;
  // אותו תו שוב ושוב ("אאאא")
  if (/^(.)\1+$/.test(s.replace(/\s/g, ''))) return true;
  // מכיל ספרות בלבד או תווים שאינם אותיות
  if (!/[א-תa-z]/.test(s)) return true;
  // רצף של 5+ עיצורים זהים-משפחה ללא אימות קריאה (יוריסטיקה עדינה)
  if (/[בגדהוזחטיכלמנסעפצקרשתא]{9,}/.test(s.replace(/\s/g, '')) && !/[אהוי]/.test(s)) return true;
  return false;
}
