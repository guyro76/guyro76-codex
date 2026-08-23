/**
 * בחירת השחקן שנכנס למשחק — בלי מסך בורר.
 *
 * המשחק נבנה בהתחלה למכשיר משפחתי אחד עם שני ילדים, ולכן היה מסך
 * "מי משחק היום?". מרגע שיש חשבונות זה כבר לא נכון: מי שנכנס לחשבון
 * שלו צריך להגיע ישר לאזור האישי שלו, ובוודאי לא לראות רשימה של
 * ילדים אחרים עם השמות, התמונות והניקוד שלהם — זו חשיפה שהכללים
 * אוסרים במפורש.
 *
 * לכן: **חשבון אחד = שחקן אחד.**
 *
 * הפונקציה כאן לא מוחקת כלום. במכשיר שכבר יש בו כמה פרופילים
 * מתקופת הבורר, השאר נשארים במסד ונגישים להורה במסך ההורים —
 * פרופיל של ילד עם התקדמות שנעלמת הוא אובדן נתונים, לא ניקיון.
 */
import { db } from '../db/db';
import type { Profile } from '../types';

export interface PlayerIdentity {
  firstName: string;
  photo?: string | null;
}

/** שדות ברירת המחדל של שחקן חדש */
function blankProfile(name: string, photo?: string | null): Omit<Profile, 'id'> {
  return {
    name,
    avatar: '🙂',
    photo: photo ?? undefined,
    color: '#7c5cff',
    gender: 'other',
    age: 11,
    difficulty: 'medium',
    soundOn: true,
    reducedMotion: false,
    favoriteCategories: [],
    totalScore: 0,
    wins: 0,
    gamesPlayed: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    originalitySum: 0,
    bestRoundScore: 0,
    dailyStreak: 0,
    lastDailyDate: '',
    achievements: [],
    createdAt: new Date().toISOString()
  };
}

/**
 * בוחר את הפרופיל של המשתמש מתוך מה שקיים במכשיר.
 *
 * הסדר חשוב, וכל שלב בו קיים בגלל מצב אמיתי:
 *  1. פרופיל בשם של החשבון — מכשיר שכבר שיחקו בו, שהפרופיל שלו נוצר
 *     מאותו חשבון. זה חייב לנצח, אחרת המשתמש יקבל פרופיל של מישהו
 *     אחר שנמצא במכשיר.
 *  2. פרופיל יחיד — אין למי להתבלבל איתו.
 *  3. אין התאמה — הראשון שנוצר. מקרה קצה של מכשיר משותף מהתקופה
 *     שלפני החשבונות; ההורה יכול להחליף במסך ההורים.
 */
export function pickProfile(profiles: Profile[], identity?: PlayerIdentity | null): Profile | null {
  if (profiles.length === 0) return null;
  const wanted = identity?.firstName?.trim();
  if (wanted) {
    const match = profiles.find((p) => p.name.trim() === wanted);
    if (match) return match;
  }
  if (profiles.length === 1) return profiles[0];
  return profiles[0];
}

/**
 * מחזיר את השחקן שאיתו נכנסים, ויוצר אותו אם אין.
 *
 * מחזיר null רק כשהאחסון חסום לגמרי — ואז המסך שקורא לזה מציג
 * הודעה במקום להיתקע על מסך ריק.
 */
export async function resolveActivePlayer(identity?: PlayerIdentity | null): Promise<Profile | null> {
  try {
    const profiles = await db.profiles.toArray();
    const existing = pickProfile(profiles, identity);
    if (existing) return existing;

    const name = identity?.firstName?.trim() || 'שחקן';
    const id = await db.profiles.add(blankProfile(name, identity?.photo) as Profile);
    return (await db.profiles.get(id)) ?? null;
  } catch {
    return null;
  }
}

/** פרופילים נוספים שנשארו במכשיר מתקופת הבורר — להורה בלבד */
export function otherProfiles(profiles: Profile[], active: Profile | null): Profile[] {
  return profiles.filter((p) => p.id !== active?.id);
}
