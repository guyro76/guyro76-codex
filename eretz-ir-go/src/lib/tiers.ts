/**
 * חבילות שימוש.
 *
 * **החינם הוא המשחק בלבד.** סיבוב ארץ-עיר לבד מול השעון, וזהו: בלי
 * פאזלים, בלי ארנק ופרסים, בלי משחק מול אחרים, בלי משחקי ביניים —
 * ועם פרסומות בין השלבים. מי שמשלם מקבל את כל אלה ובלי פרסומות.
 *
 * זו החלטה מסחרית מפורשת, והיא מחליפה מדיניות קודמת שבה החינם היה
 * מלא ובלי פרסומות. שני דברים נגזרים ממנה ואסור לשכוח אותם:
 *  1. מדיניות הפרטיות חייבת לומר שיש פרסומות — היא הצהירה שאין.
 *  2. עם פרסום צד שלישי המשחק אינו עומד בתנאי קטגוריית הילדים של
 *     אפל. ב-Google Play Families זה אפשרי עם SDK מאושר, ורק בפרסום
 *     שאינו מותאם אישית — ולכן `personalisedAds` לא קיים כאן בכלל.
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
  /** פרסומות בין השלבים */
  ads: boolean;
  /** לוחות הפאזל ואיסוף החלקים */
  puzzles: boolean;
  /** ארנק, פרסים וקלפי כוח */
  rewards: boolean;
  /** משחק מול שחקן אחר — במכשיר או ברשת */
  multiplayer: boolean;
}

export const TIERS: Record<Tier, TierSpec> = {
  free: {
    id: 'free',
    name: 'גרסת חינם',
    icon: '🎈',
    blurb: 'המשחק הבסיסי — סיבוב לבד, עם פרסומות בין השלבים',
    maxProfiles: 1,
    maxRounds: 3,
    customCategories: false,
    miniGames: false,
    answerImages: false,
    onlineVerification: true,
    letterSwaps: 0,
    cloudSync: false,
    onlineLeaderboard: false,
    ads: true,
    puzzles: false,
    rewards: false,
    multiplayer: false
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
    onlineLeaderboard: false,
    ads: false,
    puzzles: true,
    rewards: true,
    multiplayer: true
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
    onlineLeaderboard: true,
    ads: false,
    puzzles: true,
    rewards: true,
    multiplayer: true
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
    onlineLeaderboard: true,
    ads: false,
    puzzles: true,
    rewards: true,
    multiplayer: true
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

/**
 * היכולות בפועל, לפי מצב החשבון ולפי סוג הבנייה.
 *
 * `entitlementsEnforced` הוא בדיוק "האם קיימת בבנייה הזו מערכת
 * חשבונות" (`authConfigured()`). הוא נקבע בזמן בנייה ממשתני סביבה,
 * ולכן אינו ניתן לשינוי מהדפדפן — זו לא דלת אחורית.
 *
 * כשהוא `false` אין שרת, אין ממי לקנות חבילה ואין מה לאכוף: זו
 * בנייה מקומית, בדיקה או פיתוח, והמשחק פתוח במלואו — בדיוק ההבטחה
 * שכתובה ב-`supabase.ts`, שהמשחק המקומי אף פעם לא היה תלוי בענן.
 * הבניות שנשלחות לחנויות ולאתר כן מוגדרות, ולכן שם מי שאין לו
 * חשבון בתשלום מקבל את הגרסה החינמית — הבסיסית, עם הפרסומות.
 */
export function capabilitiesFor(
  account: { tier: Tier; role: Role } | null,
  entitlementsEnforced: boolean
): TierSpec {
  if (!entitlementsEnforced) return TIERS.gold;
  if (!account) return TIERS.free;
  return effectiveTier(account.tier, account.role);
}
