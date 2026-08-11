import { describe, expect, it } from 'vitest';
import {
  FREE_SWAPS,
  MAX_SWAPS,
  SWAP_PRICE,
  canAffordSwap,
  canPayForSwap,
  payForSwap,
  swapOption,
  swapsLeft
} from '../src/lib/letterSwap';
import { RIDDLES, isRiddleAnswerCorrect, pickRiddle } from '../src/data/riddles';

describe('החלפת אות', () => {
  it('הראשונה חינם, השנייה בתשלום, ואין שלישית', () => {
    expect(swapOption(0)).toBe('free');
    expect(swapOption(1)).toBe('paid');
    expect(swapOption(2)).toBe('none');
    expect(swapOption(99)).toBe('none');
  });

  it('הספירה שנותרה נעצרת באפס ולא יורדת למינוס', () => {
    expect(swapsLeft(0)).toBe(MAX_SWAPS);
    expect(swapsLeft(1)).toBe(MAX_SWAPS - FREE_SWAPS);
    expect(swapsLeft(2)).toBe(0);
    expect(swapsLeft(50)).toBe(0);
  });

  it('קונים רק כשיש מספיק, בכל אחד משני האמצעים', () => {
    expect(canAffordSwap({ bills: SWAP_PRICE.bills, gems: 0 }, 'bills')).toBe(true);
    expect(canAffordSwap({ bills: SWAP_PRICE.bills - 1, gems: 0 }, 'bills')).toBe(false);
    expect(canAffordSwap({ bills: 0, gems: SWAP_PRICE.gems }, 'gems')).toBe(true);
    expect(canAffordSwap({ bills: 0, gems: SWAP_PRICE.gems - 1 }, 'gems')).toBe(false);
  });

  it('מספיק שאחד האמצעים מכסה', () => {
    expect(canPayForSwap({ bills: 0, gems: 0 })).toBe(false);
    expect(canPayForSwap({ bills: SWAP_PRICE.bills, gems: 0 })).toBe(true);
    expect(canPayForSwap({ bills: 0, gems: SWAP_PRICE.gems })).toBe(true);
  });

  it('התשלום מוריד רק מהאמצעי שנבחר, ולעולם לא למינוס', () => {
    const wallet = { bills: 5, gems: 3 };
    expect(payForSwap(wallet, 'bills')).toEqual({ bills: 5 - SWAP_PRICE.bills, gems: 3 });
    expect(payForSwap(wallet, 'gems')).toEqual({ bills: 5, gems: 3 - SWAP_PRICE.gems });
    expect(payForSwap({ bills: 0, gems: 0 }, 'bills')).toBeNull();
    expect(payForSwap({ bills: 0, gems: 0 }, 'gems')).toBeNull();
  });

  it('החלפה זולה מקניית תשובה — זו רק אות', async () => {
    const { ANSWER_PRICE } = await import('../src/lib/wallet');
    expect(SWAP_PRICE.bills).toBeLessThan(ANSWER_PRICE.bills);
    expect(SWAP_PRICE.gems).toBeLessThan(ANSWER_PRICE.gems);
  });
});

describe('חידות ההחלפה', () => {
  it('לכל חידה יש שאלה ולפחות תשובה אחת, והמזהים ייחודיים', () => {
    const ids = RIDDLES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const r of RIDDLES) {
      expect(r.question.length).toBeGreaterThan(10);
      expect(r.answers.length).toBeGreaterThan(0);
      expect(r.answers[0].trim()).not.toBe('');
    }
  });

  it('כל תשובה רשמית מתקבלת', () => {
    for (const r of RIDDLES) {
      for (const a of r.answers) expect(isRiddleAnswerCorrect(r, a), `${r.id}: ${a}`).toBe(true);
    }
  });

  it('ילד שכותב בלי ה׳ הידיעה, עם רווחים או עם נקודה — עדיין צודק', () => {
    const sun = RIDDLES.find((r) => r.id === 'sun')!;
    for (const guess of ['שמש', ' שמש ', 'השמש', 'שמש.', 'שמש!']) {
      expect(isRiddleAnswerCorrect(sun, guess), guess).toBe(true);
    }
  });

  it('תשובה שגויה או ריקה נדחית', () => {
    const sun = RIDDLES.find((r) => r.id === 'sun')!;
    for (const guess of ['ירח', '', '   ', 'שמשון']) {
      expect(isRiddleAnswerCorrect(sun, guess), guess).toBe(false);
    }
  });

  it('לא חוזרים על חידה שכבר הוצגה', () => {
    const usedIds = RIDDLES.slice(0, RIDDLES.length - 1).map((r) => r.id);
    expect(pickRiddle(usedIds).id).toBe(RIDDLES[RIDDLES.length - 1].id);
  });

  it('כשכל החידות נוצלו עדיין מוחזרת חידה — לא קורסים', () => {
    const all = RIDDLES.map((r) => r.id);
    expect(RIDDLES).toContainEqual(pickRiddle(all));
  });
});
