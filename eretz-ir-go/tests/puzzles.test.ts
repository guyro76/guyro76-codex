import { describe, expect, it } from 'vitest';
import { PUZZLES, lookupTitle, pieceCount, puzzleById } from '../src/data/puzzles';
import { isBadImageKind } from '../src/lib/imageVerify';
import { hasScene } from '../src/components/PuzzleScene';
import {
  applyAward,
  awardPiece,
  isComplete,
  openPuzzles,
  prune,
  summary,
  type PuzzleProgress
} from '../src/lib/puzzlePieces';

/** גנרטור דטרמיניסטי לפי seed */
const rngFor = (seed: number) => {
  let x = seed + 1;
  return () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return x / 2147483648;
  };
};

/** מדמה n סיבובים ומחזיר את מצב האיסוף ואת רצף הפאזלים שזכו */
function play(rounds: number, seed = 7) {
  const rng = rngFor(seed);
  let progress: PuzzleProgress = {};
  let last: string | undefined;
  const order: string[] = [];
  for (let i = 0; i < rounds; i++) {
    const award = awardPiece(progress, last, rng);
    if (!award) break;
    progress = applyAward(progress, award);
    last = award.puzzleId;
    order.push(award.puzzleId);
  }
  return { progress, order };
}

describe('הגדרת הפאזלים', () => {
  it('לכל פאזל שם, עובדה ומידות סבירות', () => {
    for (const p of PUZZLES) {
      expect(p.name.trim()).not.toBe('');
      expect(p.fact.length).toBeGreaterThan(20);
      expect(p.cols).toBeGreaterThan(1);
      expect(p.rows).toBeGreaterThan(1);
      // לוח שדורש יותר מ-9 סיבובים הופך מפרס למטלה
      expect(pieceCount(p)).toBeLessThanOrEqual(9);
    }
  });

  it('המזהים ייחודיים', () => {
    expect(new Set(PUZZLES.map((p) => p.id)).size).toBe(PUZZLES.length);
  });

  it('יש מספיק פאזלים כדי שהאיסוף יימשך', () => {
    expect(PUZZLES.length).toBeGreaterThanOrEqual(6);
  });

  /**
   * ההבטחה של הפיצ'ר היא שהחלקים מתחברים לתמונה. פאזל בלי איור
   * גיבוי שמור בחבילה שובר אותה בדיוק ברגע הכי גרוע — אחרי שהילד
   * אסף את כל החלקים ואין לו רשת.
   */
  it('לכל פאזל יש איור גיבוי בתוך החבילה — לא תלוי ברשת', () => {
    const missing = PUZZLES.filter((p) => !hasScene(p.id)).map((p) => p.name);
    expect(missing, `פאזלים בלי איור: ${missing.join(', ')}`).toEqual([]);
  });

  /**
   * כותרות החיפוש נבדקו מול ה-API האמיתי של ויקיפדיה העברית, ושתיים
   * מהן נכשלו ותוקנו: "עין גדי" הוא דף פירושונים (השער פוסל אותו),
   * ולערך "עכו" יש סמל עיר כתמונה ראשית ולא צילום (השער פוסל גם
   * אותו). הבדיקה נועלת את התיקון, כדי שמישהו לא "יפשט" אותו בחזרה
   * לשם התצוגה ויחזיר לוחות בלי צילום.
   */
  it('הפאזלים שדורשים כותרת ערך אחרת שומרים עליה', () => {
    expect(lookupTitle(puzzleById('ein-gedi')!)).toBe('נחל דוד');
    expect(lookupTitle(puzzleById('akko')!)).toBe('נמל עכו');
    // ובלי lookup — מחפשים לפי שם התצוגה
    expect(lookupTitle(puzzleById('masada')!)).toBe('מצדה');
  });

  it('כותרת החיפוש לא ריקה לאף פאזל', () => {
    for (const p of PUZZLES) expect(lookupTitle(p).trim().length, p.id).toBeGreaterThan(1);
  });

  /**
   * התמונות שהוחזרו בפועל עבור כל שמונת הפאזלים, כפי שנבדקו מול
   * ה-API. הבדיקה מוודאת שאף אחת מהן אינה נפסלת כמפה/דגל/סמל —
   * זה בדיוק מה שקרה לערך "עכו".
   */
  it('הצילומים שנבדקו עוברים את שער "לא מפה ולא סמל"', () => {
    const resolved: Record<string, string> = {
      מצדה: 'Israel-2013-Aerial-Masada.jpg',
      'ים המלח': 'Dead_sea.jpg',
      הכנרת: 'Sea_of_Galilee.jpg',
      'מכתש רמון': 'MakhteshRamonMar2.jpg',
      'נחל דוד': 'שמורת עין גדי2.jpg',
      'ראש הנקרה': 'Mediterranean_Sea_Rosh_Hanikra.jpg',
      'נמל עכו': 'עכו001.jpg',
      קיסריה: 'קיסריה.jpg'
    };
    for (const [title, file] of Object.entries(resolved)) {
      expect(isBadImageKind(`https://upload.wikimedia.org/x/${file}`), title).toBe(false);
    }
    // ולהפך: הסמל של עכו, שהיה התמונה הראשית של הערך "עכו", אכן נפסל
    expect(isBadImageKind('https://upload.wikimedia.org/x/Coat_of_arms_of_Akko.svg')).toBe(true);
  });
});

describe('חלוקת חלקים', () => {
  it('בסוף כל סיבוב נופל בדיוק חלק אחד', () => {
    const { progress } = play(10);
    const total = Object.values(progress).reduce((s, list) => s + list.length, 0);
    expect(total).toBe(10);
  });

  it('אין חלק כפול באותו פאזל', () => {
    const { progress } = play(40);
    for (const [id, pieces] of Object.entries(progress)) {
      expect(new Set(pieces).size, id).toBe(pieces.length);
      const puzzle = puzzleById(id)!;
      for (const piece of pieces) {
        expect(piece).toBeGreaterThanOrEqual(0);
        expect(piece).toBeLessThan(pieceCount(puzzle));
      }
    }
  });

  /**
   * הכלל שהוגדר במפורש: לא כל סיבוב תורם לאותו פאזל. אם החלקים
   * היו נופלים ברצף על לוח אחד, זה היה לוח אחד ארוך במקום כמה
   * לוחות שמתקדמים במקביל.
   */
  it('לא אותו פאזל פעמיים ברצף', () => {
    const { order } = play(30);
    for (let i = 1; i < order.length; i++) {
      expect(order[i], `סיבוב ${i}`).not.toBe(order[i - 1]);
    }
  });

  it('אחרי כמה סיבובים כמה לוחות פתוחים במקביל', () => {
    const { progress } = play(8);
    expect(Object.keys(progress).length).toBeGreaterThanOrEqual(2);
  });

  it('בסוף — כל הפאזלים מושלמים ואין יותר מה לחלק', () => {
    const needed = PUZZLES.reduce((s, p) => s + pieceCount(p), 0);
    const { progress } = play(needed + 5);
    for (const puzzle of PUZZLES) {
      expect(isComplete(puzzle, progress[puzzle.id]), puzzle.name).toBe(true);
    }
    expect(openPuzzles(progress)).toEqual([]);
    expect(awardPiece(progress)).toBeNull();
  });

  it('כשנשאר פאזל אחד פתוח — הוא כן חוזר ברצף, אחרת שום דבר לא יסתיים', () => {
    const progress: PuzzleProgress = {};
    for (const puzzle of PUZZLES.slice(1)) {
      progress[puzzle.id] = Array.from({ length: pieceCount(puzzle) }, (_, i) => i);
    }
    const only = PUZZLES[0];
    const first = awardPiece(progress, only.id, rngFor(3))!;
    expect(first.puzzleId).toBe(only.id);
  });

  it('הזכייה האחרונה מסומנת כהשלמה', () => {
    const puzzle = PUZZLES[0];
    const almost: PuzzleProgress = {
      [puzzle.id]: Array.from({ length: pieceCount(puzzle) - 1 }, (_, i) => i)
    };
    for (const other of PUZZLES.slice(1)) {
      almost[other.id] = Array.from({ length: pieceCount(other) }, (_, i) => i);
    }
    const award = awardPiece(almost, undefined, rngFor(1))!;
    expect(award.puzzleId).toBe(puzzle.id);
    expect(award.completed).toBe(true);
    expect(award.have).toBe(award.total);
  });

  it('applyAward לא משנה את המקור', () => {
    const before: PuzzleProgress = { masada: [0] };
    const after = applyAward(before, {
      puzzleId: 'masada',
      piece: 1,
      have: 2,
      total: 6,
      completed: false
    });
    expect(before.masada).toEqual([0]);
    expect(after.masada).toEqual([0, 1]);
  });

  it('החלוקה מתפרסת על פני הפאזלים ולא נתקעת על אחד', () => {
    // 40 סיבובים בכמה seeds — אף פאזל לא אמור לבלוע את רוב החלקים
    for (const seed of [1, 2, 3, 11, 42]) {
      const { order } = play(40, seed);
      const counts = new Map<string, number>();
      for (const id of order) counts.set(id, (counts.get(id) ?? 0) + 1);
      const biggest = Math.max(...counts.values());
      expect(biggest / order.length, `seed ${seed}`).toBeLessThan(0.5);
    }
  });
});

describe('שמירה ושחזור', () => {
  it('נתון שנשמר לפאזל שכבר לא קיים מסונן החוצה', () => {
    expect(prune({ 'no-such-puzzle': [0, 1], masada: [0] })).toEqual({ masada: [0] });
  });

  it('אינדקס חלק מחוץ לתחום מסונן', () => {
    const puzzle = PUZZLES[0];
    const cleaned = prune({ [puzzle.id]: [0, 999, -3] });
    expect(cleaned[puzzle.id]).toEqual([0]);
  });

  it('הסיכום סופר חלקים ולוחות מושלמים', () => {
    const puzzle = PUZZLES[0];
    const full = Array.from({ length: pieceCount(puzzle) }, (_, i) => i);
    const stats = summary({ [puzzle.id]: full, [PUZZLES[1].id]: [0, 1] });
    expect(stats.completed).toBe(1);
    expect(stats.pieces).toBe(pieceCount(puzzle) + 2);
    expect(stats.total).toBe(PUZZLES.length);
  });
});
