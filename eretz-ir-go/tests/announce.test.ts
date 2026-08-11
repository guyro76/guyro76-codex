import { afterEach, describe, expect, it, vi } from 'vitest';
import { announce, setAnnouncer } from '../src/lib/announce';

afterEach(() => setAnnouncer(null));

describe('הכרזות לקוראי מסך', () => {
  it('הודעה מגיעה למאזין הרשום', () => {
    const heard: string[] = [];
    setAnnouncer((m) => heard.push(m));
    announce('האות שהוגרלה היא ג');
    expect(heard).toEqual(['האות שהוגרלה היא ג']);
  });

  it('הכרזה בלי מאזין לא מפילה כלום', () => {
    setAnnouncer(null);
    expect(() => announce('שלום')).not.toThrow();
  });

  it('הודעה ריקה לא נשלחת — כדי לא לגרום להקראה מיותרת', () => {
    const listener = vi.fn();
    setAnnouncer(listener);
    announce('');
    expect(listener).not.toHaveBeenCalled();
  });

  it('רק המאזין האחרון פעיל, כך שלא מוקרא פעמיים', () => {
    const first = vi.fn();
    const second = vi.fn();
    setAnnouncer(first);
    setAnnouncer(second);
    announce('סיום סיבוב');
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith('סיום סיבוב');
  });
});
