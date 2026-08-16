/**
 * שיתוף תוצאה.
 *
 * כללי הבטיחות שנשמרים כאן, ואינם משתמעים מאליהם:
 * - **השיתוף תמיד ביוזמת המשתמש.** שום דבר לא נשלח לאף אחד בלי
 *   לחיצה מפורשת, ואין שיתוף אוטומטי בסיום משחק.
 * - **הטקסט נבנה מקומית ואינו עובר בשום שרת שלנו.** הוא נמסר למערכת
 *   ההפעלה, והילד בוחר לאן. אנחנו לא יודעים ולא רוצים לדעת.
 * - **אין תמונות, אין קישור לפרופיל ואין מזהה כלשהו.** רק שמות
 *   התצוגה שההורה הגדיר במכשיר, האותיות והניקוד.
 *
 * מסלול נסיגה: אם המכשיר לא תומך ב-Web Share (רוב הדפדפנים במחשב),
 * מעתיקים ללוח. חשוב שהכפתור לא ייעלם — ילד שלוחץ ולא קורה כלום
 * חושב שהמשחק שבור.
 */

export interface ShareSummary {
  /** שמות וניקוד, לפי סדר יורד */
  scores: { name: string; score: number }[];
  letters: string[];
  rounds: number;
  coop: boolean;
  /** מילה מקורית במיוחד להצגה, אם הייתה */
  bestWord?: { text: string; originality: number };
}

export const GAME_URL = 'https://eretz-ir-go.vercel.app';

/** מדליה למקום. מעבר לשלישי — בלי, כדי לא להצחיק על חשבון אף אחד */
function medal(index: number, coop: boolean): string {
  if (coop) return '🤝';
  return ['🥇', '🥈', '🥉'][index] ?? '·';
}

export function buildShareText(s: ShareSummary): string {
  const lines: string[] = ['ארץ-עיר GO! 🎡'];

  const letters = s.letters.filter(Boolean);
  if (letters.length) {
    lines.push(`${letters.length > 1 ? 'האותיות' : 'האות'} ${letters.join(' · ')} — ${s.rounds} סיבובים`);
  }

  lines.push('');
  const ranked = [...s.scores].sort((a, b) => b.score - a.score);
  for (const [i, p] of ranked.entries()) {
    lines.push(`${medal(i, s.coop)} ${p.name} — ${p.score} נק׳`);
  }

  if (s.bestWord) {
    lines.push('', `✨ מילה מקורית במיוחד: "${s.bestWord.text}" (${s.bestWord.originality}%)`);
  }

  lines.push('', `רוצים לשחק גם? ${GAME_URL}`);
  return lines.join('\n');
}

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

/**
 * משתפת את הטקסט. מחזירה מה קרה בפועל, כדי שהמסך יוכל להגיד
 * "הועתק!" רק כשזה באמת מה שקרה.
 */
export async function shareText(text: string): Promise<ShareOutcome> {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;

  if (nav?.share) {
    try {
      await nav.share({ text });
      return 'shared';
    } catch (err) {
      // ביטול של המשתמש הוא לא תקלה, ואסור להציג עליו שגיאה
      if (err instanceof Error && err.name === 'AbortError') return 'cancelled';
      // כישלון אחר — ממשיכים אל ההעתקה במקום להיכשל בשקט
    }
  }

  try {
    if (nav?.clipboard?.writeText) {
      await nav.clipboard.writeText(text);
      return 'copied';
    }
  } catch {
    // ההרשאה נדחתה או שההקשר אינו מאובטח
  }

  return 'failed';
}
