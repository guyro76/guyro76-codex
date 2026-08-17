import { db, getSetting } from '../db/db';
import {
  applyAward,
  awardPiece,
  prune,
  type Award,
  type PuzzleProgress
} from './puzzlePieces';

/**
 * שמירת מצב הפאזלים במכשיר, לכל פרופיל בנפרד.
 *
 * נשמר בטבלת ההגדרות ולא בטבלה חדשה: זה אובייקט קטן אחד לפרופיל,
 * וטבלה נפרדת הייתה מחייבת שדרוג סכמה של Dexie בלי להרוויח כלום.
 * הכול מקומי — מצב הפאזלים לא עולה לשום שרת.
 */
const key = (profileId: number) => `puzzles:${profileId}`;
const lastKey = (profileId: number) => `puzzles-last:${profileId}`;

export async function loadProgress(profileId: number): Promise<PuzzleProgress> {
  const raw = await getSetting(key(profileId));
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as PuzzleProgress;
    // נתון שנשמר בגרסה קודמת עלול להצביע על פאזל שכבר לא קיים
    return prune(parsed);
  } catch {
    // נתון פגום לא אמור להפיל מסך שלם; מתחילים מחדש
    return {};
  }
}

/**
 * מעניקה חלק על סיום סיבוב ושומרת.
 *
 * מחזירה null כשכל הפאזלים כבר הושלמו — ואז המסך פשוט לא מציג
 * הודעת פרס, במקום להציג "קיבלת 0 חלקים".
 */
export async function grantRoundPiece(
  profileId: number
): Promise<{ award: Award; owned: number[] } | null> {
  const last = await getSetting(lastKey(profileId));

  /**
   * הקריאה והכתיבה בתוך טרנזקציה אחת, ובכוונה לא דרך getSetting.
   *
   * getSetting מחזיר undefined גם כשהקריאה פשוט איטית מדי, ובמסלול
   * הזה "לא הצלחתי לקרוא" היה מתפרש כ"אין עדיין חלקים" — ואז
   * הכתיבה הייתה **דורסת את כל האוסף**. על מכשיר עמוס זה אוסף של
   * ילד שנעלם. טרנזקציה שנכשלת פשוט לא מעניקה חלק הפעם.
   */
  try {
    return await db.transaction('rw', db.settings, async () => {
      const row = await db.settings.get(key(profileId));
      let progress: PuzzleProgress = {};
      if (row?.value) {
        try {
          progress = prune(JSON.parse(row.value) as PuzzleProgress);
        } catch {
          progress = {};
        }
      }

      const award = awardPiece(progress, last);
      if (!award) return null;

      const next = applyAward(progress, award);
      await db.settings.put({ key: key(profileId), value: JSON.stringify(next) });
      await db.settings.put({ key: lastKey(profileId), value: award.puzzleId });
      // מחזירים גם את החלקים בפועל: המסך צריך לדעת אילו משבצות
      // לחשוף, ולא רק כמה יש
      return { award, owned: next[award.puzzleId] ?? [] };
    });
  } catch {
    return null;
  }
}
