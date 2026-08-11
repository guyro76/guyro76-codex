import type { PayMethod, Wallet } from './wallet';

/**
 * החלפת אות.
 *
 * כל ילד מכיר את התסכול של אות שאי אפשר לעשות איתה כלום, ולכן:
 * - ההחלפה **הראשונה בכל משחק חינם**, בלי תנאים ובלי קלפי כוח.
 * - ההחלפה **השנייה נקנית** — או בקרדיט מהארנק, או בפתרון חידה.
 * - יותר משתיים אין, אחרת אפשר פשוט לסובב עד שנוחתת אות קלה.
 *
 * החידה היא הדרך של מי שאין לו קרדיט: תמיד יש מסלול שלא דורש כלום
 * חוץ מלחשוב, כדי שילד בלי צבירה לא ייתקע.
 */
export const FREE_SWAPS = 1;
export const MAX_SWAPS = 2;

/** מחיר ההחלפה הנקנית — זול מקניית תשובה, כי זו רק אות */
export const SWAP_PRICE: Wallet = { bills: 2, gems: 1 };

export type SwapOption = 'free' | 'paid' | 'none';

/** מה עומד לרשות השחקן בהחלפה הבאה */
export function swapOption(used: number): SwapOption {
  if (used < FREE_SWAPS) return 'free';
  if (used < MAX_SWAPS) return 'paid';
  return 'none';
}

/** כמה החלפות נשארו בסך הכול */
export function swapsLeft(used: number): number {
  return Math.max(0, MAX_SWAPS - used);
}

/** האם יש מספיק קרדיט לשלם על החלפה באמצעי הנתון */
export function canAffordSwap(wallet: Wallet, method: PayMethod): boolean {
  return method === 'bills' ? wallet.bills >= SWAP_PRICE.bills : wallet.gems >= SWAP_PRICE.gems;
}

/** האם אפשר לשלם בכלל, באחד משני האמצעים */
export function canPayForSwap(wallet: Wallet): boolean {
  return canAffordSwap(wallet, 'bills') || canAffordSwap(wallet, 'gems');
}

/** יתרת הארנק אחרי תשלום. null כשאין מספיק — לעולם לא יורדים למינוס. */
export function payForSwap(wallet: Wallet, method: PayMethod): Wallet | null {
  if (!canAffordSwap(wallet, method)) return null;
  return method === 'bills'
    ? { ...wallet, bills: wallet.bills - SWAP_PRICE.bills }
    : { ...wallet, gems: wallet.gems - SWAP_PRICE.gems };
}
