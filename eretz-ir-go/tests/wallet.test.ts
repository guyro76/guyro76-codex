import { describe, expect, it } from 'vitest';
import { ANSWER_PRICE, canAfford, canBuyAnswer, roundEarnings } from '../src/lib/wallet';
import { MINI_GAMES, partialReward, pickMiniGame } from '../src/lib/miniGames';

describe('ארנק המשחק', () => {
  it('קונים רק כשיש מספיק — אין יתרה שלילית', () => {
    expect(canAfford({ bills: ANSWER_PRICE.bills, gems: 0 }, 'bills')).toBe(true);
    expect(canAfford({ bills: ANSWER_PRICE.bills - 1, gems: 0 }, 'bills')).toBe(false);
    expect(canAfford({ bills: 0, gems: ANSWER_PRICE.gems }, 'gems')).toBe(true);
    expect(canAfford({ bills: 0, gems: ANSWER_PRICE.gems - 1 }, 'gems')).toBe(false);
  });

  it('מספיק שאחד האמצעים מכסה כדי שאפשר יהיה לקנות', () => {
    expect(canBuyAnswer({ bills: 0, gems: 0 })).toBe(false);
    expect(canBuyAnswer({ bills: ANSWER_PRICE.bills, gems: 0 })).toBe(true);
    expect(canBuyAnswer({ bills: 0, gems: ANSWER_PRICE.gems })).toBe(true);
  });

  it('רווחי סיבוב: שטר לתשובה, בונוס ללוח מושלם, יהלום למקוריות', () => {
    expect(roundEarnings(3, 5, 0)).toEqual({ bills: 3, gems: 0 });
    expect(roundEarnings(5, 5, 0)).toEqual({ bills: 7, gems: 0 });
    expect(roundEarnings(4, 5, 2)).toEqual({ bills: 4, gems: 2 });
    expect(roundEarnings(0, 5, 0)).toEqual({ bills: 0, gems: 0 });
  });
});

describe('משימות הביניים', () => {
  it('בחירת המשימה יציבה לאותו סיבוב ואות', () => {
    expect(pickMiniGame(2, 'ג').id).toBe(pickMiniGame(2, 'ג').id);
  });

  it('סיבובים עוקבים מקבלים משימות שונות', () => {
    const seed = 'ל';
    expect(pickMiniGame(0, seed).id).not.toBe(pickMiniGame(1, seed).id);
  });

  it('הצלחה מלאה נותנת את הבונוס המלא', () => {
    for (const spec of MINI_GAMES) {
      expect(partialReward(spec, 1)).toEqual(spec.reward);
      expect(partialReward(spec, 1.5)).toEqual(spec.reward);
    }
  });

  it('הצלחה חלקית נותנת בונוס חלקי, בלי יהלומים', () => {
    const spec = MINI_GAMES[0];
    const half = partialReward(spec, 0.5);
    expect(half.points).toBe(Math.floor(spec.reward.points * 0.5));
    expect(half.wallet.gems).toBe(0);
    expect(partialReward(spec, 0)).toEqual({ points: 0, wallet: { bills: 0, gems: 0 } });
  });
});
