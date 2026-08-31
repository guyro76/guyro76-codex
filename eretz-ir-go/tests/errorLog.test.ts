import { describe, expect, it } from 'vitest';
import { sanitizeMessage } from '../src/lib/errorLog';

/**
 * יומן התקלות הוא היחיד במשחק ששומר טקסט שנוצר בזמן ריצה, ולכן
 * הוא גם המקום היחיד שבו תשובה של ילד עלולה לדלוף ליומן. הניקוי
 * כאן הוא ההגנה.
 */
describe('ניקוי הודעת שגיאה', () => {
  /**
   * שגיאות מצטטות ערכים במרכאות — וזה בדיוק המקום שבו תשובה של
   * ילד מגיעה. עדיף הודעה פחות מדויקת מאשר תשובה של ילד ביומן.
   */
  it('מסיר תוכן שבתוך מרכאות', () => {
    expect(sanitizeMessage('התשובה "כלב" נדחתה')).toBe('התשובה "…" נדחתה');
    expect(sanitizeMessage("failed on 'דנה'")).toBe('failed on "…"');
    // גם מרכאות מסולסלות, שמגיעות מטקסט עברי
    expect(sanitizeMessage('נכשל על ”ירושלים“')).toBe('נכשל על "…"');
  });

  it('משאיר הודעה רגילה כמו שהיא', () => {
    expect(sanitizeMessage('TypeError: x is not a function')).toBe('TypeError: x is not a function');
  });

  it('מכווץ רווחים ושורות', () => {
    expect(sanitizeMessage('  Error:\n\n  משהו   קרה  ')).toBe('Error: משהו קרה');
  });

  /** stack ארוך תופס מקום ולא מוסיף מידע */
  it('מקצץ הודעה ארוכה', () => {
    expect(sanitizeMessage('א'.repeat(2000)).length).toBeLessThanOrEqual(400);
  });

  it('הודעה ריקה נשארת ריקה', () => {
    expect(sanitizeMessage('   ')).toBe('');
  });
});
