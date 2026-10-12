import { GAME_LETTERS, type GameLetter } from './hebrew';
import type { Difficulty, KnowledgeItem } from '../types';

/** דירוג "קלות" של אותיות בעברית לפי שפע התשובות המקובל */
const EASY_LETTERS: GameLetter[] = ['א', 'ב', 'מ', 'ש', 'ת', 'ה', 'כ', 'ל', 'נ'];
const HARD_LETTERS: GameLetter[] = ['ז', 'ט', 'צ', 'ע', 'ו'];

export function lettersForDifficulty(difficulty: Difficulty): GameLetter[] {
  if (difficulty === 'easy') return EASY_LETTERS;
  if (difficulty === 'hard') return HARD_LETTERS;
  return GAME_LETTERS.filter((l) => !HARD_LETTERS.includes(l)) as GameLetter[];
}

/**
 * ספירת כיסוי: לכמה מהקטגוריות הפעילות יש לפחות תשובה מאומתת אחת באות.
 * אות נחשבת "אפשרית" רק אם לרוב הקטגוריות יש כיסוי.
 */
export function letterCoverage(
  letter: string,
  categoryIds: string[],
  index: Map<string, Set<string>> // key: `${categoryId}|${letter}` -> normalized names
): number {
  let covered = 0;
  for (const cat of categoryIds) {
    const set = index.get(`${cat}|${letter}`);
    if (set && set.size > 0) covered++;
  }
  return covered;
}

/** בניית אינדקס קטגוריה+אות מהמאגר */
export function buildLetterIndex(items: KnowledgeItem[]): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  for (const item of items) {
    for (const cat of item.categoryIds) {
      const key = `${cat}|${item.firstLetter}`;
      let set = index.get(key);
      if (!set) {
        set = new Set();
        index.set(key, set);
      }
      set.add(item.normalizedName);
    }
  }
  return index;
}

/** רף ההגרלה: אות כשירה רק אם לפחות 60% מהקטגוריות מכוסות בה */
const MIN_COVERAGE_SHARE = 0.6;

/**
 * האותיות שההגרלה באמת יכולה לבחור לצירוף הזה.
 *
 * מיוצא כדי שמסך בחירת הקטגוריות ישתמש **באותו כלל בדיוק** כמו
 * ההגרלה. אזהרה שמחושבת בכלל אחר הייתה מבטיחה דבר אחד ומקיימת
 * דבר אחר.
 */
export function viableLetters(
  categoryIds: string[],
  difficulty: Difficulty,
  index: Map<string, Set<string>>,
  exclude: string[] = []
): GameLetter[] {
  const pool = lettersForDifficulty(difficulty).filter((l) => !exclude.includes(l));
  const minCoverage = Math.ceil(categoryIds.length * MIN_COVERAGE_SHARE);
  return pool.filter((l) => letterCoverage(l, categoryIds, index) >= minCoverage);
}

/**
 * האם הצירוף דל מכדי לשחק בו טוב: פחות משליש מאותיות הדרגה כשירות.
 * בארבעת ה-presets זה לא קורה אף פעם (17/17). זה קורה כשילד בוחר
 * בעצמו רק קטגוריות של שמות פרטיים, שאי אפשר לאמת בלי מקור חיצוני.
 */
export function isThinSelection(
  categoryIds: string[],
  difficulty: Difficulty,
  index: Map<string, Set<string>>
): boolean {
  if (categoryIds.length === 0) return false;
  const pool = lettersForDifficulty(difficulty);
  return viableLetters(categoryIds, difficulty, index).length < Math.ceil(pool.length / 3);
}

/**
 * אילו קטגוריות להוסיף כדי שהצירוף יפסיק להיות דל — **המספר המינימלי**
 * שבאמת מספיק, ולא מספר קבוע.
 *
 * הנוסח הראשון של הכפתור הוסיף תמיד שתיים, וזה לא עבד: רף ההגרלה
 * הוא 60% מהקטגוריות, ולכן כל קטגוריה שנוספת מעלה גם את הרף. חמש
 * קטגוריות דלות צריכות **חמש** קלאסיות כדי להשתחרר; עם שתיים האזהרה
 * נשארת על המסך, והילד לחץ על "תיקון" שלא תיקן כלום.
 *
 * מחזיר null כשאין כמות שנכנסת בתקרה — ואז אסור להציע כפתור בכלל.
 */
export function categoriesToFixThin(
  selected: string[],
  candidates: string[],
  difficulty: Difficulty,
  index: Map<string, Set<string>>,
  max = 12
): string[] | null {
  const pool = candidates.filter((id) => !selected.includes(id));
  const room = Math.min(max - selected.length, pool.length);
  for (let k = 1; k <= room; k++) {
    const add = pool.slice(0, k);
    if (!isThinSelection([...selected, ...add], difficulty, index)) return add;
  }
  return null;
}

/**
 * הגרלת אות הוגנת: רק אותיות שבהן לפחות 60% מהקטגוריות הפעילות
 * מכוסות במאגר, כדי לא ליפול על שילוב בלתי אפשרי.
 */
export function drawLetter(
  categoryIds: string[],
  difficulty: Difficulty,
  index: Map<string, Set<string>>,
  exclude: string[] = [],
  rng: () => number = Math.random
): GameLetter {
  const pool = lettersForDifficulty(difficulty).filter((l) => !exclude.includes(l));
  const viable = viableLetters(categoryIds, difficulty, index, exclude);
  if (viable.length > 0) return viable[Math.floor(rng() * viable.length)];

  /**
   * אין אף אות שעוברת את רף 60%.
   *
   * זה קורה כשהילד בוחר בעצמו צירוף של קטגוריות דלות — למשל שיר,
   * להקה, ספר, משחק מחשב וקבוצת ספורט, שכולן קטגוריות של שמות
   * פרטיים שאי אפשר לאמת בלי מקור חיצוני. בדרגה "קשה" הצירוף הזה
   * מגיע לאפס אותיות כשירות.
   *
   * קודם הגיבוי היה הגרלה אחידה מכל המאגר, כלומר הילד היה יכול
   * לקבל דווקא את האות הגרועה ביותר — זו שאין לה אף תשובה בשום
   * קטגוריה שבחר. אם בכל מקרה מתפשרים, מתפשרים על **הטובה
   * שאפשר**: נבחרת אות מבין אלה שמכסות את מספר הקטגוריות הגדול
   * ביותר.
   */
  const fallback = pool.length > 0 ? pool : [...GAME_LETTERS];
  let best = -1;
  for (const letter of fallback) best = Math.max(best, letterCoverage(letter, categoryIds, index));
  const bestLetters = fallback.filter((l) => letterCoverage(l, categoryIds, index) === best);
  return bestLetters[Math.floor(rng() * bestLetters.length)];
}

/** מחולל מספרים דטרמיניסטי (mulberry32) — לאתגר היומי */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
