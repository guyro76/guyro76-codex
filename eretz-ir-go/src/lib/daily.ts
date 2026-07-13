import { seededRandom } from './letters';
import { GAME_LETTERS } from './hebrew';
import { CLASSIC_CATEGORY_IDS, CATEGORIES } from '../data/categories';

/**
 * האתגר היומי — נגזר דטרמיניסטית מהתאריך המקומי,
 * ולכן עובד גם במצב Offline מלא וזהה לכל השחקנים באותו יום.
 */

export interface DailyChallengeSpec {
  date: string; // YYYY-MM-DD
  letter: string;
  categoryIds: string[];
  seconds: number;
  originalityBonusX2: boolean;
}

export function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dailyChallenge(dateKey: string = todayKey()): DailyChallengeSpec {
  const seed = [...dateKey].reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7) >>> 0;
  const rng = seededRandom(seed);
  const letter = GAME_LETTERS[Math.floor(rng() * GAME_LETTERS.length)];
  // 4 קטגוריות קלאסיות + קטגוריה מיוחדת מתחלפת
  const classics = [...CLASSIC_CATEGORY_IDS].sort(() => rng() - 0.5).slice(0, 4);
  const specials = CATEGORIES.filter((c) => !c.classic);
  const special = specials[Math.floor(rng() * specials.length)];
  return {
    date: dateKey,
    letter,
    categoryIds: [...classics, special.id],
    seconds: 120,
    originalityBonusX2: rng() > 0.5
  };
}
