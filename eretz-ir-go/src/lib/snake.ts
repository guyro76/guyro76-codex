/**
 * הלוגיקה של "נחשון האותיות", מופרדת מהרכיב.
 *
 * הופרדה לכאן אחרי שהמשחק דווח כבלתי שחיק: הפנייה בכפתורים הזיזה
 * את הנחש לכיוון ההפוך, ואכילה לא תמיד נספרה. שתי התקלות נבעו מכך
 * שהמצב חושב בתוך פונקציית עדכון של React — מקום שבו אסור לבצע
 * תופעות לוואי, ושבמצב פיתוח מורץ פעמיים. כאן הכול פונקציה טהורה
 * אחת שמקבלת מצב ומחזירה מצב, ולכן אפשר לבדוק אותה.
 */

export const SIZE = 11;
/** כמה פירות צריך כדי לזכות. קצר בכוונה — זו הפסקה בין סיבובים */
export const TARGET = 5;

export type Point = { x: number; y: number };
export type Dir = 'up' | 'down' | 'left' | 'right';

/**
 * y גדל כלפי מטה, x גדל ימינה — כמו על המסך.
 * המגרש עצמו מסודר ב-CSS כ-LTR דווקא בגלל זה: בדף RTL רשת CSS
 * מסדרת עמודות מימין לשמאל, וכל כפתורי הכיוון היו מתהפכים.
 */
export const STEP: Record<Dir, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

export const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };

export interface SnakeState {
  snake: Point[];
  dir: Dir;
  /** תור הפניות שנלחצו ועוד לא בוצעו — כך שתי לחיצות מהירות לא נבלעות */
  queue: Dir[];
  food: Point;
  eaten: number;
  dead: boolean;
  /** אירועים שהתרחשו בצעד האחרון — הרכיב מנגן עליהם צליל */
  ate: boolean;
}

export function samePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

/** מיקום אקראי פנוי. חסום במספר ניסיונות ואז סורק — לעולם לא נתקע */
export function randomFood(taken: Point[], rand: () => number = Math.random): Point {
  const free: Point[] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const p = { x, y };
      if (!taken.some((t) => samePoint(t, p))) free.push(p);
    }
  }
  if (free.length === 0) return { x: 0, y: 0 };
  return free[Math.min(free.length - 1, Math.floor(rand() * free.length))];
}

export function initialState(rand: () => number = Math.random): SnakeState {
  const start = { x: Math.floor(SIZE / 2), y: Math.floor(SIZE / 2) };
  const snake = [start, { x: start.x - 1, y: start.y }];
  return {
    snake,
    dir: 'right',
    queue: [],
    food: randomFood(snake, rand),
    eaten: 0,
    dead: false,
    ate: false
  };
}

/**
 * רישום פנייה. נבדקת מול הכיוון האחרון בתור ולא מול הכיוון הנוכחי,
 * כי אחרת לחיצה שנייה מהירה נמדדת מול כיוון שכבר עומד להשתנות —
 * וזו הייתה הסיבה לתחושה ש"הכפתורים לא מגיבים".
 */
export function turn(state: SnakeState, next: Dir): SnakeState {
  if (state.dead) return state;
  const last = state.queue[state.queue.length - 1] ?? state.dir;
  if (next === last || next === OPPOSITE[last]) return state;
  if (state.queue.length >= 2) return state;
  return { ...state, queue: [...state.queue, next] };
}

/** תרגום החלקה על המסך לכיוון. מתחת לסף פשוט מתעלמים — נגיעה אינה החלקה */
export const SWIPE_MIN_PX = 14;

export function swipeDir(dx: number, dy: number): Dir | null {
  if (Math.abs(dx) < SWIPE_MIN_PX && Math.abs(dy) < SWIPE_MIN_PX) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

/**
 * צעד אחד. פונקציה טהורה: אותו קלט תמיד מחזיר אותו פלט, ואין בה
 * צליל, שעון או `setState`. המגרש טורואידלי — יוצאים מצד אחד
 * ונכנסים מהשני, כך שרק התנגשות בעצמך מפסידה.
 */
export function step(state: SnakeState, rand: () => number = Math.random): SnakeState {
  if (state.dead || state.eaten >= TARGET) return { ...state, ate: false };

  const [dir, ...queue] = state.queue.length ? state.queue : [state.dir];
  const move = STEP[dir];
  const head: Point = {
    x: (state.snake[0].x + move.x + SIZE) % SIZE,
    y: (state.snake[0].y + move.y + SIZE) % SIZE
  };

  const ate = samePoint(head, state.food);
  // הזנב מתפנה באותו צעד, ולכן דריכה על המשבצת שהוא עוזב אינה התנגשות
  const body = ate ? state.snake : state.snake.slice(0, -1);
  if (body.some((s) => samePoint(s, head))) {
    return { ...state, dir, queue, dead: true, ate: false };
  }

  const snake = [head, ...body];
  return {
    ...state,
    snake,
    dir,
    queue,
    eaten: ate ? state.eaten + 1 : state.eaten,
    food: ate ? randomFood(snake, rand) : state.food,
    ate
  };
}

export function isWon(state: SnakeState): boolean {
  return state.eaten >= TARGET;
}

export function isOver(state: SnakeState): boolean {
  return state.dead || isWon(state);
}
