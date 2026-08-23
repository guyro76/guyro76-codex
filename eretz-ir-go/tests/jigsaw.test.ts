import { describe, expect, it } from 'vitest';
import { jigsawCut, reverseEdge, type Edge } from '../src/lib/jigsaw';

const cut = (seed = 'masada', cols = 3, rows = 2) =>
  jigsawCut({ cols, rows, width: 600, height: 400, seed });

/** כל הנקודות שמסלול עובר בהן, כטקסט — כדי להשוות גבולות בין חלקים */
function coords(path: string): string[] {
  return [...path.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => m[0]);
}

/** הצגת גבול כרצף מספרים, באותו עיגול שבו המסלול נכתב */
function edgeNums(edge: Edge): string[] {
  const out = [String(round(edge.from.x)), String(round(edge.from.y))];
  for (const s of edge.segs) {
    out.push(
      String(round(s.c1.x)),
      String(round(s.c1.y)),
      String(round(s.c2.x)),
      String(round(s.c2.y)),
      String(round(s.to.x)),
      String(round(s.to.y))
    );
  }
  return out;
}
const round = (n: number) => (Math.abs(n) < 1e-9 ? 0 : Math.round(n * 1000) / 1000);

const contains = (hay: string[], needle: string[]) =>
  hay.some((_, i) => needle.every((v, j) => hay[i + j] === v));

describe('גזירת פאזל', () => {
  it('יש מסלול סגור לכל חלק', () => {
    const c = cut();
    for (let i = 0; i < 6; i++) {
      const p = c.piecePath(i);
      expect(p.startsWith('M'), `חלק ${i}`).toBe(true);
      expect(p.endsWith('Z'), `חלק ${i}`).toBe(true);
      expect(p.split('C').length - 1, `חלק ${i} — מעט מדי עקומות`).toBeGreaterThanOrEqual(4);
    }
  });

  /**
   * זו הבדיקה שבאמת חשובה. שני חלקים שכנים חייבים לחלוק את **אותה
   * עקומה בדיוק**, אחד בכיוון אחד והשני בהפוך. אם כל חלק היה מגריל
   * את הגבול שלו, היה נוצר רווח או חפיפה בין הפין לשקע — והפאזל לא
   * היה מתחבר.
   */
  it('שכנים אופקיים חולקים בדיוק את אותו גבול', () => {
    const c = cut('kinneret', 3, 3);
    for (let r = 0; r < 3; r++) {
      for (let col = 0; col < 2; col++) {
        const shared = c.vEdge(r, col + 1);
        const left = coords(c.piecePath(r * 3 + col));
        const right = coords(c.piecePath(r * 3 + col + 1));
        expect(contains(left, edgeNums(shared)), `שורה ${r} עמודה ${col}`).toBe(true);
        expect(contains(right, edgeNums(reverseEdge(shared))), `שורה ${r} עמודה ${col}`).toBe(true);
      }
    }
  });

  it('שכנים אנכיים חולקים בדיוק את אותו גבול', () => {
    const c = cut('akko', 3, 3);
    for (let r = 0; r < 2; r++) {
      for (let col = 0; col < 3; col++) {
        const shared = c.hEdge(r + 1, col);
        const top = coords(c.piecePath(r * 3 + col));
        const bottom = coords(c.piecePath((r + 1) * 3 + col));
        expect(contains(top, edgeNums(reverseEdge(shared))), `שורה ${r}`).toBe(true);
        expect(contains(bottom, edgeNums(shared)), `שורה ${r}`).toBe(true);
      }
    }
  });

  it('היפוך גבול פעמיים מחזיר אותו בדיוק', () => {
    const c = cut();
    const e = c.vEdge(0, 1);
    expect(reverseEdge(reverseEdge(e))).toEqual(e);
  });

  /** לפאזל אין פינים בולטים החוצה — השפה החיצונית ישרה */
  it('שפות הלוח ישרות', () => {
    const c = cut('ramon', 3, 2);
    for (let col = 0; col < 3; col++) {
      for (const r of [0, 2]) {
        const e = c.hEdge(r, col);
        expect(e.segs.length, `גבול אופקי בשורה ${r}`).toBe(1);
        expect(e.segs[0].c1.y).toBe(e.from.y);
        expect(e.segs[0].c2.y).toBe(e.from.y);
      }
    }
    for (let r = 0; r < 2; r++) {
      for (const col of [0, 3]) {
        const e = c.vEdge(r, col);
        expect(e.segs.length, `גבול אנכי בעמודה ${col}`).toBe(1);
        expect(e.segs[0].c1.x).toBe(e.from.x);
      }
    }
  });

  it('גבולות פנימיים אינם ישרים — אחרת אלה ריבועים', () => {
    const c = cut('caesarea', 3, 3);
    expect(c.vEdge(1, 1).segs.length).toBeGreaterThan(1);
    expect(c.hEdge(1, 1).segs.length).toBeGreaterThan(1);
  });

  /** ילד שחוזר מחר צריך לראות את אותם חלקים בדיוק */
  it('אותו seed נותן תמיד את אותו חיתוך, ו-seed אחר נותן אחר', () => {
    expect(cut('masada').piecePath(0)).toBe(cut('masada').piecePath(0));
    expect(cut('masada').piecePath(0)).not.toBe(cut('ein-gedi').piecePath(0));
  });

  it('החלקים מכסים את הלוח כולו — פינות הלוח נמצאות בחלקי הקצה', () => {
    const c = cut('rosh-hanikra', 3, 2);
    expect(c.piecePath(0)).toContain('M 0 0');
    // החלק הימני-תחתון חייב להגיע לפינה (600,400)
    expect(coords(c.piecePath(5))).toEqual(expect.arrayContaining(['600', '400']));
  });
});
