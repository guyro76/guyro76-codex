/**
 * הלוגיקה של איקס-עיגול, בנפרד מהתצוגה — כדי שאפשר יהיה לבדוק
 * את היריב באמת ולא רק לראות שהלוח מצויר.
 *
 * היריב משחק "כמעט מושלם": הוא תמיד משלים ניצחון ותמיד חוסם הפסד,
 * אבל בשאר המהלכים בוחר באקראי מתוך המשבצות הטובות. כך ילד יכול
 * לנצח אותו לפעמים, בלי שהמשחק יהיה טריוויאלי.
 */
export type Cell = 'x' | 'o' | null;

export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export function winnerOf(board: Cell[]): Cell {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

export function isFull(board: Cell[]): boolean {
  return board.every((c) => c !== null);
}

/** משבצת שמשלימה שורה עבור השחקן הנתון, אם יש כזו */
export function winningMove(board: Cell[], who: 'x' | 'o'): number | null {
  for (const [a, b, c] of LINES) {
    const line = [board[a], board[b], board[c]];
    const idx = [a, b, c];
    const mine = line.filter((v) => v === who).length;
    const empty = line.findIndex((v) => v === null);
    if (mine === 2 && empty !== -1) return idx[empty];
  }
  return null;
}

/** סדר העדיפויות: לנצח, לחסום, מרכז, פינה, ואם אין — משבצת פנויה כלשהי */
export function computerMove(board: Cell[]): number {
  const win = winningMove(board, 'o');
  if (win != null) return win;
  const block = winningMove(board, 'x');
  if (block != null) return block;
  if (board[4] === null) return 4;
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
  const free = board.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0);
  return free[Math.floor(Math.random() * free.length)];
}

/** ניצחון = בונוס מלא, תיקו = חצי, הפסד = כלום */
export function progressFor(winner: Cell): number {
  if (winner === 'x') return 1;
  if (winner === 'o') return 0;
  return 0.5;
}
