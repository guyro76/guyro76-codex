import { describe, expect, it } from 'vitest';
import { soloSummary } from '../src/lib/persona';

/**
 * משחק יחיד הציג "ניצחת! ניצחון! כל הכבוד! 🏆" גם כשהניקוד היה
 * אפס. שתי בעיות באותו מסך: לא היה מול מי לנצח, ואפס נקודות אינו
 * הישג. שבח על כלום אינו עידוד — ילד מזהה אותו.
 */
const uri = { name: 'אורי' };

describe('סיכום משחק יחיד', () => {
  it('אפס נקודות אינו חגיגה', () => {
    const s = soloSummary(uri, 0, false);
    expect(s.celebrate).toBe(false);
    expect(s.title).not.toMatch(/ניצח|אלוף|כל הכבוד/);
    // אבל גם לא נוזף — מזמין לנסות שוב
    expect(s.note).toContain('עוד סיבוב');
  });

  /** גם "שיא" מדומה על אפס לא נחשב */
  it('אפס נקודות אינו חגיגה גם כשמסומן כשיא', () => {
    expect(soloSummary(uri, 0, true).celebrate).toBe(false);
  });

  it('שיא אישי מקבל גביע ומספר', () => {
    const s = soloSummary(uri, 240, true);
    expect(s.celebrate).toBe(true);
    expect(s.icon).toBe('🏆');
    expect(s.title).toContain('שיא אישי');
    expect(s.note).toContain('240');
  });

  it('סיבוב רגיל מקבל שבח מדוד, בלי להכריז ניצחון', () => {
    const s = soloSummary(uri, 80, false);
    expect(s.celebrate).toBe(true);
    expect(s.note).toContain('80');
    expect(s.title).not.toContain('ניצח');
  });

  it('השם מופיע בכל המקרים', () => {
    for (const [score, record] of [
      [0, false],
      [80, false],
      [240, true]
    ] as const) {
      expect(soloSummary(uri, score, record).title).toContain('אורי');
    }
  });

  /**
   * ניקוד שלילי אינו אמור לקרות, אבל אם יקרה — הוא לא ייחשב
   * חגיגה. גבול שנשמר בקוד עדיף על הנחה שהוא לא ייבדק.
   */
  it('ניקוד שלילי מתנהג כמו אפס', () => {
    expect(soloSummary(uri, -5, true).celebrate).toBe(false);
  });
});
