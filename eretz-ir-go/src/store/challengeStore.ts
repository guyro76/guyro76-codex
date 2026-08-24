import { create } from 'zustand';
import type { Challenge } from '../lib/challenge';
import { readChallengeFromHash } from '../lib/challenge';

/**
 * מצב האתגר הפעיל.
 *
 * שני שדות ולא אחד, בכוונה:
 *  - `incoming` הוא אתגר שהגיע מקישור ועדיין לא התחילו לשחק אותו.
 *  - `active` הוא האתגר שמשחקים עכשיו, וממנו נבנית ההשוואה בסוף.
 *
 * ההפרדה נדרשת כי בין השניים יש מסך אישור: ילד שפותח קישור צריך
 * לראות מי אתגר אותו ומה הוא צריך לנצח *לפני* שהשעון מתחיל, ולא
 * ליפול ישר לתוך סיבוב.
 */
interface ChallengeState {
  incoming: Challenge | null;
  active: Challenge | null;

  /** קורא אתגר מה-hash של הכתובת ומנקה אותה. מחזיר האם נמצא. */
  captureFromUrl: () => boolean;
  /** מעבר מהזמנה למשחק בפועל */
  accept: () => Challenge | null;
  clear: () => void;
}

export const useChallenge = create<ChallengeState>((set, get) => ({
  incoming: null,
  active: null,

  captureFromUrl: () => {
    if (typeof window === 'undefined') return false;
    const found = readChallengeFromHash(window.location.hash);
    if (!found) return false;

    /**
     * הכתובת מנוקה מיד אחרי הקריאה.
     *
     * שתי סיבות, ושתיהן אמיתיות: רענון של הדף באמצע המשחק היה
     * מתחיל את האתגר מחדש; ומטען שנשאר בשורת הכתובת נכנס להיסטוריה
     * ולשיתופי מסך. `replaceState` ולא ניווט — כדי לא להוסיף
     * רשומה להיסטוריה שכפתור "אחורה" ייפול עליה.
     */
    try {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch {
      /* דפדפן שחוסם — האתגר עדיין נקרא, וזה מה שחשוב */
    }

    set({ incoming: found });
    return true;
  },

  accept: () => {
    const challenge = get().incoming;
    if (!challenge) return null;
    set({ incoming: null, active: challenge });
    return challenge;
  },

  clear: () => set({ incoming: null, active: null })
}));
