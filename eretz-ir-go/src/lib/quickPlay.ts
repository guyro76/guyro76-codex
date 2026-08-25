import { CATEGORIES, CLASSIC_CATEGORY_IDS } from '../data/categories';
import { getSetting } from '../db/db';
import { loadModeDraft } from '../screens/ModeSelect';
import type { Category, GameSettings, Profile } from '../types';

/**
 * "שוב, כמו קודם" — התחלת משחק בלחיצה אחת.
 *
 * ## למה זה נולד
 *
 * הדרך למשחק עברה חמש הקשות: משחק חדש ← בחירת מצב ← קטגוריות ←
 * להגרלת האות ← מתחילים. בפעם הראשונה כל מסך שם עושה עבודה אמיתית,
 * ובפעם החמישים כולם מכשול: הילד כבר יודע מה הוא רוצה, והוא רוצה
 * לשחק. משחקי ארץ-עיר האחרים בחנות פותחים ישר לתוך משחק, וזה יתרון
 * אמיתי שלהם — לא בתוכן אלא בחיכוך.
 *
 * ## מה נשמר ומה נכפה
 *
 * ההגדרות נלקחות מהמשחק הקודם (`modeDraft` ו-`favoriteCategorySet`),
 * ולכן "כמו קודם" הוא באמת כמו קודם. שני דברים נכפים בכל זאת:
 *
 * 1. **תמיד משחק עצמי.** מצב שדורש יריב — במכשיר, מול המחשב או
 *    מרחוק — אינו יכול להתחיל בלחיצה אחת, כי הוא דורש בן אדם שני.
 *    כפתור שמתחיל משחק שאי אפשר לשחק גרוע מכפתור שלא קיים.
 * 2. **מספר הסיבובים נחתך לפי החבילה.** בגרסה החינמית התקרה היא
 *    שלושה, וקיצור דרך אינו דלת אחורית לעקוף אותה.
 */

/** מצבים שאפשר לשחק לבד. כל השאר דורש בן אדם או הכנה. */
const SOLO_MODES = ['solo', 'practice'] as const;
type SoloMode = (typeof SOLO_MODES)[number];

function soloModeOf(mode: string): SoloMode {
  return (SOLO_MODES as readonly string[]).includes(mode) ? (mode as SoloMode) : 'solo';
}

export interface QuickPlayPlan {
  settings: GameSettings;
  categories: Category[];
}

/** מינימום קטגוריות לסיבוב תקין, כמו במסך הבחירה */
const MIN_CATEGORIES = 5;

/**
 * בונה את המשחק המהיר מההעדפות השמורות.
 *
 * מחזיר `null` רק כשאין פרופיל — בכל מצב אחר יש נפילה אחורה
 * לקלאסיקה, כי כפתור שלפעמים לא עושה כלום הוא באג ולא הגנה.
 */
export async function planQuickPlay(
  profile: Profile | null | undefined,
  customCategories: Category[] = [],
  maxRounds = Infinity
): Promise<QuickPlayPlan | null> {
  if (!profile) return null;

  const all = [...CATEGORIES, ...customCategories];
  const draft = await loadModeDraft();

  let ids = CLASSIC_CATEGORY_IDS;
  try {
    const saved = await getSetting('favoriteCategorySet');
    if (saved) {
      // קטגוריה מותאמת אישית שנמחקה מאז — מסננים ולא נופלים
      const parsed = (JSON.parse(saved) as string[]).filter((id) => all.some((c) => c.id === id));
      if (parsed.length >= MIN_CATEGORIES) ids = parsed;
    }
  } catch {
    /* הגדרה פגומה או אחסון חסום — הקלאסיקה תמיד עובדת */
  }

  const categories = ids.map((id) => all.find((c) => c.id === id)).filter((c): c is Category => Boolean(c));
  if (categories.length < MIN_CATEGORIES) return null;

  const mode = soloModeOf(draft.mode);
  return {
    settings: {
      mode,
      categoryIds: categories.map((c) => c.id),
      roundSeconds: mode === 'practice' ? 0 : draft.seconds,
      rounds: Math.max(1, Math.min(draft.rounds, maxRounds)),
      difficulty: profile.difficulty,
      hintsPerRound: mode === 'practice' ? 99 : 3,
      powerCards: draft.powerCards,
      choiceMode: draft.choiceMode
    },
    categories
  };
}

/**
 * האם להציג את הקיצור בכלל.
 *
 * לשחקן חדש אין "כמו קודם", והמסלול המלא הוא בדיוק מה שהוא צריך —
 * שם הוא בוחר מצב וקטגוריות בפעם הראשונה. הקיצור מופיע רק אחרי
 * שהיה משחק אחד.
 */
export function hasPlayedBefore(profile: Profile | null | undefined): boolean {
  return (profile?.gamesPlayed ?? 0) > 0;
}
