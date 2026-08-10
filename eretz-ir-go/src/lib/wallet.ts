import { db } from '../db/db';

/**
 * הארנק של המשחק — "קרדיט" שנצבר תוך כדי משחק ומאפשר לקנות תשובה
 * כשנתקעים. מטבע משחק בלבד: **אין רכישות בכסף אמיתי, אין חנות, אין
 * פרסומות ואין מטבע שנקנה** — מרוויחים אותו רק על ידי משחק.
 *
 * שני סוגים:
 * - 💵 שטרות — נצברים הרבה, על כל תשובה נכונה ועל סיום סיבוב.
 * - 💎 יהלומים — נדירים: על תשובה מקורית במיוחד ועל השלמת משימת ביניים.
 */

export interface Wallet {
  bills: number;
  gems: number;
}

export const EMPTY_WALLET: Wallet = { bills: 0, gems: 0 };

/** מחיר קניית תשובה — אפשר לשלם בשטרות או ביהלומים */
export const ANSWER_PRICE: Wallet = { bills: 3, gems: 2 };

/** הארנק נשמר לכל פרופיל בנפרד */
function key(profileId: number): string {
  return `wallet-${profileId}`;
}

export async function getWallet(profileId: number): Promise<Wallet> {
  const row = await db.settings.get(key(profileId));
  if (!row) return { ...EMPTY_WALLET };
  try {
    const parsed = JSON.parse(row.value) as Partial<Wallet>;
    return { bills: Math.max(0, parsed.bills ?? 0), gems: Math.max(0, parsed.gems ?? 0) };
  } catch {
    return { ...EMPTY_WALLET };
  }
}

export async function saveWallet(profileId: number, wallet: Wallet): Promise<void> {
  await db.settings.put({
    key: key(profileId),
    value: JSON.stringify({ bills: Math.max(0, wallet.bills), gems: Math.max(0, wallet.gems) })
  });
}

export async function earn(profileId: number, bills = 0, gems = 0): Promise<Wallet> {
  const wallet = await getWallet(profileId);
  const next = { bills: wallet.bills + bills, gems: wallet.gems + gems };
  await saveWallet(profileId, next);
  return next;
}

export type PayMethod = 'bills' | 'gems';

/** האם אפשר לשלם באמצעי הזה */
export function canAfford(wallet: Wallet, method: PayMethod): boolean {
  return method === 'bills' ? wallet.bills >= ANSWER_PRICE.bills : wallet.gems >= ANSWER_PRICE.gems;
}

/** האם אפשר לקנות תשובה בכלל (באחד מהאמצעים) */
export function canBuyAnswer(wallet: Wallet): boolean {
  return canAfford(wallet, 'bills') || canAfford(wallet, 'gems');
}

/** גובה תשלום. מחזיר null אם אין מספיק — בלי לרדת למינוס לעולם. */
export async function spendOnAnswer(profileId: number, method: PayMethod): Promise<Wallet | null> {
  const wallet = await getWallet(profileId);
  if (!canAfford(wallet, method)) return null;
  const next =
    method === 'bills'
      ? { ...wallet, bills: wallet.bills - ANSWER_PRICE.bills }
      : { ...wallet, gems: wallet.gems - ANSWER_PRICE.gems };
  await saveWallet(profileId, next);
  return next;
}

/**
 * כמה מרוויחים על תוצאות סיבוב.
 * שטר לכל תשובה נכונה, ועוד בונוס על לוח מושלם;
 * יהלום על כל תשובה מקורית במיוחד (מקוריות 90+).
 */
export function roundEarnings(correct: number, total: number, highOriginality: number): Wallet {
  const perfect = total > 0 && correct === total;
  return {
    bills: correct + (perfect ? 2 : 0),
    gems: highOriginality
  };
}

/** מונה משימות הביניים שהושלמו במלואן — משמש להישגים */
function winsKey(profileId: number): string {
  return `mini-game-wins-${profileId}`;
}

export async function getMiniGameWins(profileId: number): Promise<number> {
  const row = await db.settings.get(winsKey(profileId));
  return Number(row?.value ?? 0) || 0;
}

export async function addMiniGameWin(profileId: number): Promise<void> {
  const current = await getMiniGameWins(profileId);
  await db.settings.put({ key: winsKey(profileId), value: String(current + 1) });
}
