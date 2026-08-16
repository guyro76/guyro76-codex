import { describe, expect, it } from 'vitest';
import {
  ARTZI_LINES,
  BUCKET_CYCLE,
  LANGUAGE,
  TACTICS,
  WORLD,
  pickLine
} from '../src/data/artziLines';

const ALL = [...TACTICS, ...LANGUAGE, ...WORLD];

describe('התוכן של ארצי', () => {
  it('יש מספיק שורות כדי שלא יחזור על עצמו מהר', () => {
    expect(ALL.length).toBeGreaterThanOrEqual(30);
    for (const bucket of BUCKET_CYCLE) {
      expect(ARTZI_LINES[bucket].length).toBeGreaterThanOrEqual(10);
    }
  });

  it('אין שורות כפולות', () => {
    expect(new Set(ALL).size).toBe(ALL.length);
  });

  /**
   * הבדיקה הזו נולדה מהערה מוצדקת: "לא נביא הערות מפגרות שלא משדרות
   * רצינות". שורה של ארצי צריכה ללמד משהו — לא להיות בדיחה חלשה.
   */
  it('כל שורה מספיק ארוכה כדי לומר משהו של ממש', () => {
    for (const line of ALL) {
      expect(line.length, `קצר מדי: "${line}"`).toBeGreaterThan(35);
    }
  });

  it('אין ניסוח מזלזל או לעגני כלפי השחקן', () => {
    for (const line of ALL) {
      expect(line, `ניסוח בעייתי: "${line}"`).not.toMatch(/טיפש|מפגר|גרוע|אידיוט|כישלון/);
    }
  });

  it('לא חוזר על שורה כל עוד יש חדשות', () => {
    const used = new Set<string>();
    for (let i = 0; i < TACTICS.length; i++) {
      const line = pickLine('tactic', used);
      expect(used.has(line), `חזר על "${line}"`).toBe(false);
      used.add(line);
    }
    // כשהמאגר נגמר הוא ממחזר במקום להיתקע
    expect(typeof pickLine('tactic', used)).toBe('string');
  });

  it('המחזור עובר בין כל שלוש הקבוצות', () => {
    expect(new Set(BUCKET_CYCLE).size).toBe(3);
  });
});
