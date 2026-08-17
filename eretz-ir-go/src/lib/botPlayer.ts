import type { Difficulty, KnowledgeItem } from '../types';
import { unfinalize } from './hebrew';

/**
 * ארצי כיריב — שחקן ממוחשב למי שאין לו כרגע עם מי לשחק.
 *
 * הבעיה שזה פותר: ארץ-עיר הוא משחק של שניים ומעלה, והמשחק הזה
 * מקומי. ילד שפותח אותו לבד בשלוש אחר הצהריים יכול לשחק רק נגד
 * השעון. יריב חי משנה את החוויה לגמרי.
 *
 * מאיפה ארצי יודע תשובות: **רק ממאגר הידע שכבר נמצא במכשיר** —
 * אותו מאגר שממנו באים הרמזים. אין כאן קריאה לשירות AI, אין רשת,
 * ואין שום דבר שנשלח החוצה. ארצי משחק גם במטוס.
 *
 * ההיגיון נשמר כאן, בנפרד מהמסך, כי "כמה טוב ארצי משחק" הוא בדיוק
 * מה שצריך אפשרות לבדוק במספרים ולא בעין.
 */

export interface BotMove {
  categoryId: string;
  /** התשובה שארצי כתב, או null אם לא ידע */
  answer: string | null;
  /** כמה "חשב" לפני שכתב — לצורך ההנפשה */
  delayMs: number;
}

interface Level {
  /** הסיכוי שארצי בכלל ימצא תשובה לקטגוריה */
  accuracy: number;
  /**
   * העדפת מילים נפוצות מול נדירות.
   *
   * ארצי קל בוחר את המילה הכי מובנת מאליה — וזו דווקא זו שמזכה
   * בפחות נקודות מקוריות, ולכן ילד יכול לנצח אותו גם כשהוא עונה
   * על אותן קטגוריות. ארצי קשה מחפש את הנדירה.
   */
  preferRare: boolean;
  /** טווח ה"חשיבה" בין תשובה לתשובה, במילי-שניות */
  think: [number, number];
}

const LEVELS: Record<Difficulty, Level> = {
  easy: { accuracy: 0.55, preferRare: false, think: [700, 1500] },
  medium: { accuracy: 0.78, preferRare: false, think: [500, 1100] },
  hard: { accuracy: 0.94, preferRare: true, think: [350, 800] }
};

/** מועמדות: כל פריט במאגר שמתאים לקטגוריה ולאות */
function candidatesFor(items: KnowledgeItem[], categoryId: string, letter: string): KnowledgeItem[] {
  const target = unfinalize(letter);
  return items.filter(
    (item) => item.categoryIds.includes(categoryId) && unfinalize(item.firstLetter) === target
  );
}

/**
 * תכנון תור שלם של ארצי.
 *
 * ה-rng מוזרק כדי שהבדיקות יוכלו להריץ תרחיש קבוע. בפועל מגיע
 * Math.random.
 */
export function planBotRound(opts: {
  categoryIds: string[];
  letter: string;
  difficulty: Difficulty;
  items: KnowledgeItem[];
  rng?: () => number;
}): BotMove[] {
  const rng = opts.rng ?? Math.random;
  const level = LEVELS[opts.difficulty];
  /** אותה תשובה לא נכתבת פעמיים באותו סיבוב — זה חוק המשחק */
  const used = new Set<string>();
  const moves: BotMove[] = [];

  for (const categoryId of opts.categoryIds) {
    const [lo, hi] = level.think;
    const delayMs = Math.round(lo + rng() * (hi - lo));

    const pool = candidatesFor(opts.items, categoryId, opts.letter).filter(
      (item) => !used.has(item.normalizedName)
    );

    if (pool.length === 0 || rng() > level.accuracy) {
      moves.push({ categoryId, answer: null, delayMs });
      continue;
    }

    // מיון לפי נפיצות, ואז בחירה מתוך שליש מהרשימה בכיוון המתאים
    // לרמה. לא הפריט הראשון בדיוק, אחרת ארצי עונה כל פעם אותו דבר.
    const sorted = [...pool].sort((a, b) =>
      level.preferRare ? a.popularityScore - b.popularityScore : b.popularityScore - a.popularityScore
    );
    const window = Math.max(1, Math.ceil(sorted.length / 3));
    const pick = sorted[Math.floor(rng() * window)] ?? sorted[0];

    used.add(pick.normalizedName);
    moves.push({ categoryId, answer: pick.canonicalName, delayMs });
  }

  return moves;
}

/** כמה זמן התור של ארצי ייקח בסך הכול — למד התקדמות במסך */
export function totalThinkMs(moves: BotMove[]): number {
  return moves.reduce((sum, m) => sum + m.delayMs, 0);
}
