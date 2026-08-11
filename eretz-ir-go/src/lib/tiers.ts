/**
 * חבילות שימוש.
 *
 * העיקרון שמנחה את החלוקה: **המשחק עצמו לא נחסם לעולם.** גם בחבילה
 * החינמית אפשר לשחק כל יום, בכל המצבים ובלי פרסומות — מה שמשתנה הוא
 * הכמות והנוחות (כמה פרופילים, כמה סיבובים, כמה תוספות).
 * ילד שלא שילם לא אמור להרגיש נעול מחוץ למשחק של החברים שלו.
 */
export type Tier = 'free' | 'bronze' | 'silver' | 'gold';
export type Role = 'user' | 'admin';

export const TIER_ORDER: Tier[] = ['free', 'bronze', 'silver', 'gold'];

export interface TierSpec {
  id: Tier;
  name: string;
  icon: string;
  blurb: string;
  /** כמה פרופילים במשפחה */
  maxProfiles: number;
  /** תקרת סיבובים למשחק יחיד */
  maxRounds: number;
  /** קטגוריות מותאמות אישית */
  customCategories: boolean;
  /** משחקי ביניים */
  miniGames: boolean;
  /** תמונות לתשובות שאושרו */
  answerImages: boolean;
  /** אימות תשובות אונליין מול ויקיפדיה */
  onlineVerification: boolean;
  /** החלפות אות למשחק */
  letterSwaps: number;
  /** סנכרון בין מכשירים */
  cloudSync: boolean;
  /** לוח שיאים משפחתי מקוון */
  onlineLeaderboard: boolean;
}

export const TIERS: Record<Tier, TierSpec> = {
  free: {
    id: 'free',
    name: 'חינם',
    icon: '🎈',
    blurb: 'כל המשחק, בלי פרסומות — עם מגבלות נוחות',
    maxProfiles: 2,
    maxRounds: 5,
    customCategories: false,
    miniGames: true,
    answerImages: true,
    onlineVerification: true,
    letterSwaps: 1,
    cloudSync: false,
    onlineLeaderboard: false
  },
  bronze: {
    id: 'bronze',
    name: 'ארד',
    icon: '🥉',
    blurb: 'למשפחה קטנה — יותר פרופילים ויותר סיבובים',
    maxProfiles: 4,
    maxRounds: 10,
    customCategories: true,
    miniGames: true,
    answerImages: true,
    onlineVerification: true,
    letterSwaps: 2,
    cloudSync: false,
    onlineLeaderboard: false
  },
  silver: {
    id: 'silver',
    name: 'כסף',
    icon: '🥈',
    blurb: 'סנכרון בין מכשירים ולוח שיאים משפחתי',
    maxProfiles: 6,
    maxRounds: 15,
    customCategories: true,
    miniGames: true,
    answerImages: true,
    onlineVerification: true,
    letterSwaps: 3,
    cloudSync: true,
    onlineLeaderboard: true
  },
  gold: {
    id: 'gold',
    name: 'זהב',
    icon: '🥇',
    blurb: 'הכול פתוח, בלי מגבלות',
    maxProfiles: 12,
    maxRounds: 30,
    customCategories: true,
    miniGames: true,
    answerImages: true,
    onlineVerification: true,
    letterSwaps: 5,
    cloudSync: true,
    onlineLeaderboard: true
  }
};

/** מנהל מערכת מקבל את הכול, בלי קשר לחבילה שרשומה לו */
export function effectiveTier(tier: Tier, role: Role): TierSpec {
  return role === 'admin' ? TIERS.gold : TIERS[tier];
}

/** חבילה שפג תוקפה חוזרת לחינם. השרת מחשב את זה גם כן — כאן זו הגנה כפולה. */
export function tierAfterExpiry(tier: Tier, expiresAt: string | null): Tier {
  if (tier === 'free' || !expiresAt) return tier;
  return new Date(expiresAt).getTime() < Date.now() ? 'free' : tier;
}

/** האם החבילה `a` גבוהה מ-`b` */
export function isHigher(a: Tier, b: Tier): boolean {
  return TIER_ORDER.indexOf(a) > TIER_ORDER.indexOf(b);
}

/** תיאור קצר של הזמן שנותר, לתצוגה */
export function remainingLabel(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'פג תוקף';
  const days = Math.ceil(ms / 86_400_000);
  if (days === 1) return 'יום אחרון';
  if (days <= 30) return `עוד ${days} ימים`;
  return `עוד ${Math.ceil(days / 30)} חודשים`;
}
