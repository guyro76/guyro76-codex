import { db, getSetting } from '../db/db';
import { puzzleById } from '../data/puzzles';
import {
  COMPLETION_BONUS,
  PIECE_PRICE,
  applyAward,
  awardPiece,
  isComplete,
  missingPieces,
  prune,
  type Award,
  type PuzzleProgress
} from './puzzlePieces';
import { parseWallet, walletKey, type PayMethod, type Wallet } from './wallet';

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


function readProgress(raw: string | undefined): PuzzleProgress {
  if (!raw) return {};
  try {
    return prune(JSON.parse(raw) as PuzzleProgress);
  } catch {
    return {};
  }
}

export type BuyResult =
  | {
      ok: true;
      piece: number;
      owned: number[];
      completed: boolean;
      wallet: Wallet;
      /** הבונוס שניתן על השלמת הלוח, אם הקנייה השלימה אותו */
      bonus?: Wallet;
    }
  | { ok: false; reason: 'no-puzzle' | 'already-complete' | 'cannot-afford' | 'failed' };

/**
 * קניית חלק חסר במטבע המשחק.
 *
 * הכול בטרנזקציה אחת, ובכוונה: הארנק והאוסף הם שתי רשומות נפרדות,
 * וילד ש**שילם ולא קיבל חלק** הוא הכישלון הגרוע ביותר שיכול לקרות
 * כאן. טרנזקציה שנכשלת באמצע לא מחייבת ולא מעניקה — הכול או כלום.
 *
 * מטעם זה גם נקראת כאן רשומת הארנק ישירות ולא דרך `getWallet`:
 * קריאה מחוץ לטרנזקציה יכולה להחזיר מצב ישן, ואז החישוב היה מבוסס
 * על יתרה שכבר לא קיימת.
 */
export async function buyPiece(
  profileId: number,
  puzzleId: string,
  method: PayMethod,
  piece?: number
): Promise<BuyResult> {
  const puzzle = puzzleById(puzzleId);
  if (!puzzle) return { ok: false, reason: 'no-puzzle' };

  try {
    return await db.transaction('rw', db.settings, async () => {
      const progress = readProgress((await db.settings.get(key(profileId)))?.value);
      const owned = progress[puzzleId] ?? [];
      if (isComplete(puzzle, owned)) return { ok: false, reason: 'already-complete' } as BuyResult;

      const missing = missingPieces(puzzle, owned);
      const target = piece !== undefined && missing.includes(piece) ? piece : missing[0];
      if (target === undefined) return { ok: false, reason: 'already-complete' } as BuyResult;

      const wallet = parseWallet((await db.settings.get(walletKey(profileId)))?.value);
      const price = method === 'bills' ? PIECE_PRICE.bills : PIECE_PRICE.gems;
      const balance = method === 'bills' ? wallet.bills : wallet.gems;
      if (balance < price) return { ok: false, reason: 'cannot-afford' } as BuyResult;

      let next: Wallet =
        method === 'bills'
          ? { ...wallet, bills: wallet.bills - price }
          : { ...wallet, gems: wallet.gems - price };

      const nextOwned = [...owned, target].sort((a, b) => a - b);
      const completed = isComplete(puzzle, nextOwned);
      let bonus: Wallet | undefined;
      if (completed) {
        bonus = { bills: COMPLETION_BONUS.bills, gems: COMPLETION_BONUS.gems };
        next = { bills: next.bills + bonus.bills, gems: next.gems + bonus.gems };
      }

      await db.settings.put({
        key: key(profileId),
        value: JSON.stringify({ ...progress, [puzzleId]: nextOwned })
      });
      await db.settings.put({ key: walletKey(profileId), value: JSON.stringify(next) });

      return { ok: true, piece: target, owned: nextOwned, completed, wallet: next, bonus };
    });
  } catch {
    return { ok: false, reason: 'failed' };
  }
}

/**
 * הבונוס על לוח שהושלם בסיבוב רגיל (ולא בקנייה).
 *
 * מופרד מ-`grantRoundPiece` כדי שהענקת החלק לא תיפול בגלל תקלה
 * בארנק: החלק כבר נשמר, והבונוס הוא תוספת.
 */
export async function awardCompletionBonus(profileId: number): Promise<Wallet | null> {
  try {
    return await db.transaction('rw', db.settings, async () => {
      const wallet = parseWallet((await db.settings.get(walletKey(profileId)))?.value);
      const next = {
        bills: wallet.bills + COMPLETION_BONUS.bills,
        gems: wallet.gems + COMPLETION_BONUS.gems
      };
      await db.settings.put({ key: walletKey(profileId), value: JSON.stringify(next) });
      return next;
    });
  } catch {
    return null;
  }
}
