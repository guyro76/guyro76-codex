import { describe, expect, it } from 'vitest';
import {
  computerMove,
  isFull,
  progressFor as ticTacToeProgress,
  winnerOf,
  winningMove,
  type Cell
} from '../src/lib/ticTacToe';
import {
  CELLS,
  PICKS,
  SYMBOLS,
  bestStreak,
  buildCard,
  progressFor as scratchProgress
} from '../src/lib/scratchCard';

/** לוח מ-9 תווים: x, o או נקודה לריק */
function board(s: string): Cell[] {
  return [...s.replace(/\s/g, '')].map((c) => (c === 'x' ? 'x' : c === 'o' ? 'o' : null));
}

describe('איקס עיגול — זיהוי תוצאה', () => {
  it('מזהה ניצחון בשורה, בעמודה ובאלכסון', () => {
    expect(winnerOf(board('xxx......'))).toBe('x');
    expect(winnerOf(board('o..o..o..'))).toBe('o');
    expect(winnerOf(board('x...x...x'))).toBe('x');
    expect(winnerOf(board('..x.x.x..'))).toBe('x');
  });

  it('לוח ריק או לא מוכרע אינו ניצחון', () => {
    expect(winnerOf(board('.........'))).toBeNull();
    expect(winnerOf(board('xoxxoxoxo'))).toBeNull();
  });

  it('מזהה לוח מלא', () => {
    expect(isFull(board('xoxxoxoxo'))).toBe(true);
    expect(isFull(board('xoxxoxox.'))).toBe(false);
  });
});

describe('איקס עיגול — היריב', () => {
  it('משלים ניצחון כשיש לו הזדמנות', () => {
    // לשורה העליונה של המחשב חסרה משבצת אחת
    expect(computerMove(board('oo.xx....'))).toBe(2);
  });

  it('חוסם ניצחון של השחקן', () => {
    // לשחקן שתיים בשורה העליונה ולמחשב אין ניצחון מיידי
    expect(computerMove(board('xx....o..'))).toBe(2);
  });

  it('מעדיף ניצחון על פני חסימה כששניהם אפשריים', () => {
    // גם לשחקן וגם למחשב יש השלמה — המחשב לוקח את שלו
    const move = computerMove(board('xx.oo....'));
    expect(move).toBe(5);
  });

  it('תופס את המרכז כשהוא פנוי ואין ניצחון או חסימה', () => {
    expect(computerMove(board('x........'))).toBe(4);
  });

  it('בוחר פינה כשהמרכז תפוס', () => {
    expect([0, 2, 6, 8]).toContain(computerMove(board('....x....')));
  });

  it('תמיד מחזיר משבצת פנויה, בכל מצב לוח אפשרי', () => {
    for (let trial = 0; trial < 200; trial++) {
      const cells: Cell[] = Array(9).fill(null);
      const spots = [...Array(9).keys()].sort(() => Math.random() - 0.5);
      const filled = Math.floor(Math.random() * 8);
      spots.slice(0, filled).forEach((i, n) => (cells[i] = n % 2 === 0 ? 'x' : 'o'));
      if (winnerOf(cells) || isFull(cells)) continue;
      const move = computerMove(cells);
      expect(cells[move]).toBeNull();
    }
  });

  it('לא נותן לשחקן לנצח בשורה פתוחה — תמיד חוסם', () => {
    // כל השורות והעמודות עם שתיים לשחקן ומקום פנוי אחד
    const twoInARow = ['xx.......', 'x.x......', '.xx......', 'x..x.....', 'x...x....'];
    for (const b of twoInARow) {
      const cells = board(b);
      const gap = winningMove(cells, 'x');
      expect(gap).not.toBeNull();
      expect(computerMove(cells)).toBe(gap);
    }
  });
});

describe('איקס עיגול — בונוס', () => {
  it('ניצחון מלא, תיקו חצי, הפסד כלום', () => {
    expect(ticTacToeProgress('x')).toBe(1);
    expect(ticTacToeProgress(null)).toBe(0.5);
    expect(ticTacToeProgress('o')).toBe(0);
  });
});

describe('כרטיס גירוד', () => {
  /** מגריל תמיד מתחת ל-WIN_RATE ⇒ כרטיס זוכה */
  const alwaysWin = () => 0;

  it('כרטיס תמיד מכיל שישה שדות מהסמלים המוכרים', () => {
    for (let i = 0; i < 200; i++) {
      const card = buildCard();
      expect(card).toHaveLength(CELLS);
      for (const s of card) expect(SYMBOLS).toContain(s);
    }
  });

  it('כרטיס זוכה מכיל בדיוק שלושה סמלים זהים', () => {
    const card = buildCard(alwaysWin);
    expect(bestStreak(card)).toBe(PICKS);
  });

  it('כרטיס מפסיד לעולם לא מכיל שלושה זהים', () => {
    // 0.9 גדול מ-WIN_RATE, כך שתמיד ייבנה כרטיס מפסיד
    for (let i = 0; i < 200; i++) {
      const card = buildCard(() => 0.9);
      expect(bestStreak(card)).toBeLessThan(PICKS);
    }
  });

  it('התוצאה נקבעת מראש — אותו מקור אקראיות נותן אותו כרטיס', () => {
    const seeded = () => {
      let n = 0;
      const seq = [0.1, 0.2, 0.9, 0.4, 0.5, 0.15, 0.7, 0.3, 0.8, 0.05, 0.6, 0.45, 0.25, 0.35, 0.55];
      return () => seq[n++ % seq.length];
    };
    expect(buildCard(seeded())).toEqual(buildCard(seeded()));
  });

  it('בונוס: שלושה זהים מלא, שניים חצי, אחרת קטן', () => {
    expect(scratchProgress(['💎', '💎', '💎'])).toBe(1);
    expect(scratchProgress(['💎', '💎', '🍒'])).toBe(0.5);
    expect(scratchProgress(['💎', '🍀', '🍒'])).toBe(0.2);
  });

  it('אין ספירה לפני שנחשף משהו', () => {
    expect(bestStreak([])).toBe(0);
  });
});
