import type { Wallet } from './wallet';

/**
 * משחקי הביניים — משימה קצרה בין סיבוב לסיבוב.
 * מי שמצליח מקבל בונוס (נקודות + קרדיט לארנק); מי שלא רוצה פשוט מדלג
 * וממשיך לאות הבאה. אף פעם אין עונש על דילוג.
 */

export type MiniGameId = 'hangman' | 'snake' | 'ninja' | 'bubbles' | 'tictactoe' | 'scratch';

export interface MiniGameSpec {
  id: MiniGameId;
  name: string;
  icon: string;
  /** הסבר קצר בשורה אחת — מה עושים */
  how: string;
  /** בונוס על הצלחה מלאה */
  reward: { points: number; wallet: Wallet };
}

export const MINI_GAMES: MiniGameSpec[] = [
  {
    id: 'hangman',
    name: 'נחשו את המילה',
    icon: '🔤',
    how: 'לוחצים על אותיות וחושפים את המילה לפני שנגמרים הבלונים',
    reward: { points: 15, wallet: { bills: 3, gems: 1 } }
  },
  {
    id: 'snake',
    name: 'נחשון האותיות',
    icon: '🐍',
    how: 'מנווטים את הנחש, אוכלים נקודות ולא מתנגשים',
    reward: { points: 12, wallet: { bills: 3, gems: 0 } }
  },
  {
    id: 'ninja',
    name: 'נינג׳ה פירות',
    icon: '🍉',
    how: 'מעבירים את האצבע על הפירות וחותכים את כולם',
    reward: { points: 12, wallet: { bills: 3, gems: 0 } }
  },
  {
    id: 'tictactoe',
    name: 'איקס עיגול',
    icon: '❌⭕',
    how: 'מנצחים את המחשב בשורה של שלושה — תיקו מזכה בחצי בונוס',
    reward: { points: 12, wallet: { bills: 3, gems: 0 } }
  },
  {
    id: 'scratch',
    name: 'כרטיס גירוד',
    icon: '🪙',
    how: 'מגרדים שלושה שדות — שלושה סמלים זהים וזכיתם',
    reward: { points: 14, wallet: { bills: 3, gems: 1 } }
  },
  {
    id: 'bubbles',
    name: 'שקית פצפצים',
    icon: '🫧',
    how: 'מפוצצים את כל הבועות שיש בהן פירות — ונזהרים מהריקות',
    reward: { points: 10, wallet: { bills: 2, gems: 0 } }
  }
];

export function miniGameById(id: MiniGameId): MiniGameSpec {
  return MINI_GAMES.find((g) => g.id === id) ?? MINI_GAMES[0];
}

/**
 * בחירת משחק לסיבוב. דטרמיניסטי לפי מספר הסיבוב והאות, כך ששני
 * שחקנים באותו משחק מקבלים את אותה משימה.
 */
export function pickMiniGame(roundIndex: number, seed: string): MiniGameSpec {
  const hash = [...seed].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
  return MINI_GAMES[(roundIndex + hash) % MINI_GAMES.length];
}

/** בונוס חלקי: מי שכמעט הצליח לא יוצא בידיים ריקות */
export function partialReward(spec: MiniGameSpec, progress: number): { points: number; wallet: Wallet } {
  const ratio = Math.max(0, Math.min(1, progress));
  if (ratio >= 1) return spec.reward;
  return {
    points: Math.floor(spec.reward.points * ratio),
    wallet: { bills: Math.floor(spec.reward.wallet.bills * ratio), gems: 0 }
  };
}
