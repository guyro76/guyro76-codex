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
  const minCoverage = Math.ceil(categoryIds.length * 0.6);
  const viable = pool.filter((l) => letterCoverage(l, categoryIds, index) >= minCoverage);
  const candidates = viable.length > 0 ? viable : pool.length > 0 ? pool : [...GAME_LETTERS];
  return candidates[Math.floor(rng() * candidates.length)];
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
