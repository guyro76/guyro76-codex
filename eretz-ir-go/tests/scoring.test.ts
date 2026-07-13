import { describe, expect, it } from 'vitest';
import { scoreAnswer, originalityScore, originalityBonus, speedBonus, completionBonus } from '../src/lib/scoring';
import type { SubmittedAnswer } from '../src/types';

describe('ניקוד קלאסי', () => {
  it('תשובה ייחודית = 10 בסיס', () => {
    const s = scoreAnswer({
      isValid: true, revealed: false, duplicateWithOtherPlayer: false,
      hintsUsed: 0, originality: 0, typedAtMs: 999999, roundSeconds: 180, isNewDiscovery: false
    });
    expect(s.base).toBe(10);
  });

  it('תשובה זהה לשחקן אחר = 5 בסיס', () => {
    const s = scoreAnswer({
      isValid: true, revealed: false, duplicateWithOtherPlayer: true,
      hintsUsed: 0, originality: 0, typedAtMs: 999999, roundSeconds: 180, isNewDiscovery: false
    });
    expect(s.base).toBe(5);
  });

  it('תשובה שגויה = 0', () => {
    const s = scoreAnswer({
      isValid: false, revealed: false, duplicateWithOtherPlayer: false,
      hintsUsed: 0, originality: 100, typedAtMs: 0, roundSeconds: 180, isNewDiscovery: false
    });
    expect(s.total).toBe(0);
  });

  it('חשיפת תשובה = ללא ניקוד', () => {
    const s = scoreAnswer({
      isValid: true, revealed: true, duplicateWithOtherPlayer: false,
      hintsUsed: 3, originality: 0, typedAtMs: 0, roundSeconds: 180, isNewDiscovery: false
    });
    expect(s.total).toBe(0);
  });

  it('רמזים מפחיתים בהדרגה', () => {
    const mk = (hints: number) =>
      scoreAnswer({
        isValid: true, revealed: false, duplicateWithOtherPlayer: false,
        hintsUsed: hints, originality: 0, typedAtMs: 999999, roundSeconds: 180, isNewDiscovery: false
      });
    expect(mk(1).hintPenalty).toBe(2);
    expect(mk(2).hintPenalty).toBe(4);
    expect(mk(3).hintPenalty).toBe(7);
    expect(mk(0).noHintBonus).toBe(3);
    expect(mk(1).noHintBonus).toBe(0);
  });
});

describe('מקוריות', () => {
  it('תשובה נדירה מקבלת מדד גבוה ובונוס עד 10', () => {
    const o = originalityScore({
      popularityScore: 8, timesUsedBefore: 0, duplicateWithOtherPlayer: false, isNewDiscovery: true, usedHint: false
    });
    expect(o).toBeGreaterThanOrEqual(85);
    expect(originalityBonus(o)).toBe(10);
  });

  it('תשובה נפוצה מאוד = 0 בונוס', () => {
    const o = originalityScore({
      popularityScore: 95, timesUsedBefore: 3, duplicateWithOtherPlayer: false, isNewDiscovery: false, usedHint: false
    });
    expect(originalityBonus(o)).toBe(0);
  });

  it('כפילות עם שחקן אחר מגבילה את המדד', () => {
    const o = originalityScore({
      popularityScore: 10, timesUsedBefore: 0, duplicateWithOtherPlayer: true, isNewDiscovery: false, usedHint: false
    });
    expect(o).toBeLessThanOrEqual(25);
  });
});

describe('בונוסים', () => {
  it('בונוס מהירות ברבע הראשון', () => {
    expect(speedBonus(10_000, 180)).toBe(5);
    expect(speedBonus(170_000, 180)).toBe(0);
    expect(speedBonus(10_000, 0)).toBe(0); // ללא שעון אין בונוס
  });

  it('בונוס השלמה כשכל הקטגוריות נכונות', () => {
    const valid = { validation: { status: 'valid' }, revealed: false } as SubmittedAnswer;
    expect(completionBonus([valid, valid, valid], 3)).toBe(8);
    expect(completionBonus([valid, valid], 3)).toBe(0);
  });
});
