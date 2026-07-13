import { describe, expect, it } from 'vitest';
import { normalizeHebrew, startsWithLetter, unfinalize, spellingVariants, looksLikeGibberish } from '../src/lib/hebrew';

describe('נרמול עברית', () => {
  it('מסיר ניקוד', () => {
    expect(normalizeHebrew('תַפּוּחַ')).toBe('תפוח');
  });
  it('ממיר אותיות סופיות', () => {
    expect(unfinalize('שולחן')).toBe('שולחנ');
    expect(normalizeHebrew('ים')).toBe('ימ');
  });
  it('מאחד גרשיים ומקפים', () => {
    expect(normalizeHebrew("צ׳יפס")).toBe(normalizeHebrew("צ'יפס"));
    expect(normalizeHebrew('תל-אביב')).toBe(normalizeHebrew('תל אביב'));
  });
  it('מסיר רווחים כפולים ופיסוק', () => {
    expect(normalizeHebrew('  באר   שבע! ')).toBe('באר שבע');
  });
});

describe('בדיקת אות ראשונה', () => {
  it('מילה פשוטה', () => {
    expect(startsWithLetter('פיל', 'פ')).toBe(true);
    expect(startsWithLetter('פיל', 'ב')).toBe(false);
  });
  it('שם רב-מילי — המילה המשמעותית הראשונה', () => {
    expect(startsWithLetter('תל אביב', 'ת')).toBe(true);
    expect(startsWithLetter('באר שבע', 'ב')).toBe(true);
  });
  it("ה' הידיעה — נספרת גם עם וגם בלי", () => {
    expect(startsWithLetter('החתול', 'ח', { allowHeHaydia: true })).toBe(true);
    expect(startsWithLetter('החתול', 'ה', { allowHeHaydia: true })).toBe(true);
    expect(startsWithLetter('החתול', 'ח', { allowHeHaydia: false })).toBe(false);
  });
  it('אות עם ניקוד/סופית', () => {
    expect(startsWithLetter('מים', 'מ')).toBe(true);
  });
});

describe('כתיב מלא וחסר', () => {
  it('מייצר וריאציות של יו"ד כפולה', () => {
    const v = spellingVariants(normalizeHebrew('חיים'));
    expect(v).toContain('חיימ'); // הצורה המנורמלת המקורית
    expect(v).toContain('חימ'); // כתיב חסר
  });
  it("מסיר ה' הידיעה כווריאציה", () => {
    expect(spellingVariants('החתול')).toContain('חתול');
  });
});

describe('זיהוי ג׳יבריש', () => {
  it('תו חוזר', () => {
    expect(looksLikeGibberish('אאאא')).toBe(true);
  });
  it('מילה תקינה עוברת', () => {
    expect(looksLikeGibberish('שולחן')).toBe(false);
  });
  it('קלט ריק', () => {
    expect(looksLikeGibberish('')).toBe(true);
  });
});
