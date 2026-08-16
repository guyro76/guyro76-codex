import { describe, expect, it } from 'vitest';
import {
  OPPOSITE,
  SIZE,
  STEP,
  TARGET,
  initialState,
  isOver,
  isWon,
  randomFood,
  step,
  swipeDir,
  turn,
  type Dir,
  type SnakeState
} from '../src/lib/snake';

/**
 * הבדיקות האלה נולדו מדיווח אמיתי: "לא מגיע למצב של אכילה ואי אפשר
 * לכוון אל הפרי". שתי התקלות היו כיווניות וחישוביות, ושתיהן נבדקות כאן.
 */

/** מציב את הפרי בדיוק במקום מבוקש, כדי לבדוק אכילה בלי הגרלה */
function withFood(state: SnakeState, x: number, y: number): SnakeState {
  return { ...state, food: { x, y } };
}

const constant = () => 0;

describe('נחשון האותיות', () => {
  it('כל כיוון מזיז את הנחש בדיוק לצד שהילד ביקש', () => {
    for (const d of Object.keys(STEP) as Dir[]) {
      // מתחילים מנחש באורך 1 כדי שכל כיוון יהיה חוקי
      const base: SnakeState = { ...initialState(constant), snake: [{ x: 5, y: 5 }], queue: [d] };
      const next = step(base, constant);
      expect(next.snake[0], `הכיוון ${d}`).toEqual({
        x: 5 + STEP[d].x,
        y: 5 + STEP[d].y
      });
    }
  });

  it('"ימינה" מגדיל את x — כלומר זז ימינה על מסך LTR', () => {
    expect(STEP.right.x).toBe(1);
    expect(STEP.left.x).toBe(-1);
    expect(STEP.down.y).toBe(1);
    expect(STEP.up.y).toBe(-1);
  });

  it('דריסת הפרי מגדילה את המונה בדיוק באחד ומאריכה את הנחש', () => {
    const start = initialState(constant);
    const head = start.snake[0];
    const fed = step(withFood(start, head.x + 1, head.y), constant);
    expect(fed.eaten).toBe(1);
    expect(fed.ate).toBe(true);
    expect(fed.snake.length).toBe(start.snake.length + 1);
  });

  it('צעד בלי פרי שומר על אורך הנחש ולא סופר אכילה', () => {
    const start = withFood(initialState(constant), 0, 0);
    const moved = step(start, constant);
    expect(moved.eaten).toBe(0);
    expect(moved.ate).toBe(false);
    expect(moved.snake.length).toBe(start.snake.length);
  });

  it('אכילה חוזרת מגיעה ליעד ומסיימת בניצחון', () => {
    let s = initialState(constant);
    for (let i = 0; i < TARGET; i++) {
      const head = s.snake[0];
      s = step(withFood(s, (head.x + 1) % SIZE, head.y), constant);
    }
    expect(s.eaten).toBe(TARGET);
    expect(isWon(s)).toBe(true);
    expect(isOver(s)).toBe(true);
    expect(s.dead).toBe(false);
  });

  it('הפרי לעולם לא מוגרל על גוף הנחש', () => {
    const snake = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 }
    ];
    for (let i = 0; i < 200; i++) {
      const f = randomFood(snake);
      expect(snake.some((s) => s.x === f.x && s.y === f.y)).toBe(false);
    }
  });

  it('המגרש טורואידלי — יוצאים מצד אחד ונכנסים מהשני', () => {
    const s: SnakeState = { ...initialState(constant), snake: [{ x: SIZE - 1, y: 3 }], dir: 'right', queue: [] };
    expect(step(withFood(s, 0, 0), constant).snake[0].x).toBe(0);
  });

  it('אי אפשר להסתובב לאחור אל תוך הגוף', () => {
    const s = initialState(constant); // כיוון התחלתי ימינה
    expect(turn(s, OPPOSITE.right).queue).toEqual([]);
    expect(turn(s, 'up').queue).toEqual(['up']);
  });

  it('שתי פניות מהירות נשמרות בתור ומתבצעות בזו אחר זו', () => {
    // זה מה שנשבר קודם: הפנייה השנייה נמדדה מול כיוון שכבר עמד להשתנות
    const s = turn(turn(initialState(constant), 'up'), 'left');
    expect(s.queue).toEqual(['up', 'left']);
    const a = step(s, constant);
    expect(a.dir).toBe('up');
    const b = step(a, constant);
    expect(b.dir).toBe('left');
  });

  it('פנייה חוזרת לאותו כיוון לא ממלאת את התור', () => {
    const s = turn(turn(initialState(constant), 'up'), 'up');
    expect(s.queue).toEqual(['up']);
  });

  it('התנגשות בגוף מסיימת את המשחק', () => {
    const s: SnakeState = {
      ...initialState(constant),
      snake: [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 6, y: 6 },
        { x: 6, y: 5 },
        { x: 7, y: 5 }
      ],
      dir: 'right',
      queue: []
    };
    const hit = step(withFood(s, 0, 0), constant);
    expect(hit.dead).toBe(true);
    expect(isOver(hit)).toBe(true);
  });

  it('הליכה אל המשבצת שהזנב עוזב אינה התנגשות', () => {
    const s: SnakeState = {
      ...initialState(constant),
      snake: [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 6, y: 6 },
        { x: 6, y: 5 }
      ],
      dir: 'up',
      queue: ['right']
    };
    // הראש נכנס ל-(6,5), בדיוק המשבצת שהזנב מפנה באותו צעד
    expect(step(withFood(s, 0, 0), constant).dead).toBe(false);
  });

  it('אחרי הפסד או ניצחון הנחש לא ממשיך לזוז', () => {
    const dead: SnakeState = { ...initialState(constant), dead: true };
    expect(step(dead, constant).snake).toEqual(dead.snake);
    const win: SnakeState = { ...initialState(constant), eaten: TARGET };
    expect(step(win, constant).snake).toEqual(win.snake);
  });

  it('החלקה מתורגמת לכיוון על המסך, ונגיעה קטנה מתעלמת', () => {
    expect(swipeDir(40, 3)).toBe('right');
    expect(swipeDir(-40, 3)).toBe('left');
    expect(swipeDir(3, 40)).toBe('down');
    expect(swipeDir(3, -40)).toBe('up');
    expect(swipeDir(4, 4)).toBeNull();
  });

  it('היעד קצר מספיק כדי לא להאריך את ההפסקה בין הסיבובים', () => {
    expect(TARGET).toBeLessThanOrEqual(6);
  });
});
