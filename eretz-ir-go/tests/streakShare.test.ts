import { afterEach, describe, expect, it, vi } from 'vitest';
import { computeStreak, daysBetween, localDateKey, streakLabel } from '../src/lib/streak';
import { buildShareText, shareText, type ShareSummary } from '../src/lib/share';

/** חותמת זמן בצהריים בזמן מקומי — שעה שלא מתגלגלת ליום אחר */
function noon(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0).toISOString();
}

describe('רצף ימי משחק', () => {
  it('יום ראשון של משחק הוא רצף של אחד', () => {
    const s = computeStreak([noon('2026-08-16')], '2026-08-16');
    expect(s.current).toBe(1);
    expect(s.playedToday).toBe(true);
    expect(s.atRisk).toBe(false);
  });

  it('ימים רצופים נספרים', () => {
    const s = computeStreak(
      ['2026-08-14', '2026-08-15', '2026-08-16'].map(noon),
      '2026-08-16'
    );
    expect(s.current).toBe(3);
    expect(s.longest).toBe(3);
  });

  it('כמה משחקים באותו יום נספרים כיום אחד', () => {
    const s = computeStreak(
      [noon('2026-08-16'), noon('2026-08-16'), noon('2026-08-16')],
      '2026-08-16'
    );
    expect(s.current).toBe(1);
  });

  it('מי ששיחק אתמול עדיין ברצף — יש ארכת חסד של יום', () => {
    // בלי זה ילד שנכנס בבוקר רואה 0 ומרגיש שהפסיד משהו
    const s = computeStreak(['2026-08-14', '2026-08-15'].map(noon), '2026-08-16');
    expect(s.current).toBe(2);
    expect(s.playedToday).toBe(false);
    expect(s.atRisk).toBe(true);
  });

  it('הפסקה של יומיים מאפסת את הרצף אבל לא את השיא', () => {
    const s = computeStreak(
      ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-10'].map(noon),
      '2026-08-16'
    );
    expect(s.current).toBe(0);
    expect(s.longest).toBe(3);
  });

  it('רצף שנקטע ומתחיל מחדש — השיא נשמר', () => {
    const s = computeStreak(
      ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-15', '2026-08-16'].map(noon),
      '2026-08-16'
    );
    expect(s.current).toBe(2);
    expect(s.longest).toBe(4);
  });

  it('בלי משחקים בכלל — הכול אפס ובלי קריסה', () => {
    expect(computeStreak([], '2026-08-16')).toEqual({
      current: 0,
      longest: 0,
      playedToday: false,
      atRisk: false
    });
  });

  it('חותמת זמן פגומה לא מפילה את החישוב', () => {
    const s = computeStreak(['לא-תאריך', '', noon('2026-08-16')], '2026-08-16');
    expect(s.current).toBe(1);
  });

  it('מעבר חודש ומעבר שנה נספרים נכון', () => {
    expect(daysBetween('2026-08-31', '2026-09-01')).toBe(1);
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
    expect(computeStreak(['2026-12-31', '2027-01-01'].map(noon), '2027-01-01').current).toBe(2);
  });

  it('התאריך נגזר מהשעון המקומי ולא מ-UTC', () => {
    // משחק ב-22:00 בישראל הוא כבר "מחר" ב-UTC. אם החישוב היה על UTC,
    // הרצף היה נשבר בגלל אזור זמן — באג שכמעט אי אפשר לשחזר.
    const evening = new Date(2026, 7, 16, 22, 30).toISOString();
    expect(localDateKey(evening)).toBe('2026-08-16');
  });

  it('הניסוח מעודד בכל מצב, וגם כשאין רצף', () => {
    for (const info of [
      { current: 0, longest: 0, playedToday: false, atRisk: false },
      { current: 1, longest: 1, playedToday: true, atRisk: false },
      { current: 5, longest: 9, playedToday: false, atRisk: true },
      { current: 12, longest: 12, playedToday: true, atRisk: false }
    ]) {
      const label = streakLabel(info);
      expect(label.length).toBeGreaterThan(0);
      expect(label).not.toMatch(/הפסדת|איבדת|נכשל/);
    }
  });
});

const summary: ShareSummary = {
  scores: [
    { name: 'אורי', score: 240 },
    { name: 'נועה', score: 180 }
  ],
  letters: ['ל', 'ב'],
  rounds: 2,
  coop: false,
  bestWord: { text: 'לוד', originality: 100 }
};

describe('שיתוף תוצאה', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('הטקסט כולל את הניקוד, האותיות וקישור למשחק', () => {
    const text = buildShareText(summary);
    expect(text).toContain('אורי — 240');
    expect(text).toContain('נועה — 180');
    expect(text).toContain('ל · ב');
    expect(text).toContain('https://eretz-ir-go.vercel.app');
    expect(text).toContain("לוד");
  });

  it('המנצח מופיע ראשון גם אם הגיע שני ברשימה', () => {
    const text = buildShareText({
      ...summary,
      scores: [
        { name: 'נועה', score: 180 },
        { name: 'אורי', score: 240 }
      ]
    });
    expect(text.indexOf('אורי')).toBeLessThan(text.indexOf('נועה'));
    expect(text).toContain('🥇 אורי');
  });

  it('במשחק שיתופי אין מדליות ואין מנצח', () => {
    const text = buildShareText({ ...summary, coop: true });
    expect(text).not.toContain('🥇');
    expect(text).toContain('🤝');
  });

  /**
   * הבדיקה הזו שומרת על הבטחת הפרטיות: הטקסט המשותף לא נושא שום
   * מזהה. אם מישהו יוסיף יום אחד מזהה פרופיל או מייל לשיתוף, זה ייפול כאן.
   */
  it('הטקסט לא מכיל מייל, מזהה או כל פרט אישי מעבר לשם התצוגה', () => {
    const text = buildShareText(summary);
    expect(text).not.toMatch(/@/);
    expect(text).not.toMatch(/\b[0-9a-f]{8}-[0-9a-f]{4}/i); // UUID
    expect(text).not.toMatch(/supabase|token|id=/i);
  });

  it('משתמש ב-Web Share כשהוא קיים', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { share });
    await expect(shareText('שלום')).resolves.toBe('shared');
    expect(share).toHaveBeenCalledWith({ text: 'שלום' });
  });

  it('ביטול של המשתמש אינו שגיאה', async () => {
    const err = new Error('cancelled');
    err.name = 'AbortError';
    vi.stubGlobal('navigator', { share: vi.fn().mockRejectedValue(err) });
    await expect(shareText('שלום')).resolves.toBe('cancelled');
  });

  it('בלי Web Share — מעתיקים ללוח', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    await expect(shareText('שלום')).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledWith('שלום');
  });

  it('כשל בשיתוף נופל להעתקה במקום להיכשל בשקט', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      share: vi.fn().mockRejectedValue(new Error('not allowed')),
      clipboard: { writeText }
    });
    await expect(shareText('שלום')).resolves.toBe('copied');
  });

  it('בלי שום יכולת — מדווח כישלון ולא זורק', async () => {
    vi.stubGlobal('navigator', {});
    await expect(shareText('שלום')).resolves.toBe('failed');
  });
});
