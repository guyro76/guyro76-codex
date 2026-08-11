import { useEffect, useState } from 'react';
import { sfx } from '../../lib/sound';
import type { MiniGameProps } from './types';

/**
 * איקס-עיגול מול המחשב.
 *
 * היריב משחק "כמעט מושלם": הוא משלים ניצחון וחוסם הפסד, אבל בשאר
 * המהלכים בוחר באקראי מתוך המשבצות הטובות. כך ילד יכול לנצח בלי
 * שהמשחק יהיה טריוויאלי, ותיקו הוא תוצאה סבירה ולא ודאית.
 */
type Cell = 'x' | 'o' | null;

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function winnerOf(board: Cell[]): Cell {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

/** משבצת שמשלימה שורה עבור השחקן הנתון, אם יש כזו */
function winningMove(board: Cell[], who: 'x' | 'o'): number | null {
  for (const [a, b, c] of LINES) {
    const line = [board[a], board[b], board[c]];
    const idx = [a, b, c];
    const mine = line.filter((v) => v === who).length;
    const empty = line.findIndex((v) => v === null);
    if (mine === 2 && empty !== -1) return idx[empty];
  }
  return null;
}

function computerMove(board: Cell[]): number {
  // 1. לנצח אם אפשר, 2. לחסום, 3. מרכז, 4. פינה, 5. אקראי
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

export default function TicTacToe({ onDone, onSkip }: MiniGameProps) {
  const [board, setBoard] = useState<Cell[]>(() => Array(9).fill(null));
  const [busy, setBusy] = useState(false);

  const winner = winnerOf(board);
  const full = board.every((c) => c !== null);
  const over = winner !== null || full;

  useEffect(() => {
    if (winner === 'x') sfx.win();
    else if (winner === 'o') sfx.error();
  }, [winner]);

  const play = (i: number) => {
    if (over || busy || board[i]) return;
    const next = [...board];
    next[i] = 'x';
    setBoard(next);
    sfx.tick();
    if (winnerOf(next) || next.every((c) => c !== null)) return;

    // תור המחשב, עם השהיה קטנה כדי שיורגש כמו יריב ולא כמו מחשבון
    setBusy(true);
    setTimeout(() => {
      setBoard((current) => {
        if (winnerOf(current) || current.every((c) => c !== null)) return current;
        const after = [...current];
        after[computerMove(after)] = 'o';
        return after;
      });
      setBusy(false);
    }, 420);
  };

  /** ניצחון = בונוס מלא, תיקו = חצי, הפסד = כלום */
  const progress = winner === 'x' ? 1 : winner === 'o' ? 0 : 0.5;

  return (
    <div className="center">
      <p className="dim">אתם ❌ · המחשב ⭕</p>

      <div
        className="mg-board"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 300 }}
      >
        {board.map((cell, i) => (
          <button
            key={i}
            className="mg-bubble"
            style={{
              ['--mg-color' as string]: cell === 'x' ? '#ffd36e' : cell === 'o' ? '#7ad7ff' : '#ffffff',
              borderRadius: 14,
              fontSize: '2.1rem'
            }}
            aria-label={`משבצת ${i + 1}${cell ? (cell === 'x' ? ' — איקס' : ' — עיגול') : ' — ריקה'}`}
            disabled={over || busy || cell !== null}
            onClick={() => play(i)}
          >
            {cell === 'x' ? '❌' : cell === 'o' ? '⭕' : ''}
          </button>
        ))}
      </div>

      {over ? (
        <>
          <h2 style={{ color: winner === 'x' ? 'var(--ok)' : winner === 'o' ? 'var(--coral)' : 'var(--gold)' }}>
            {winner === 'x' ? 'ניצחתם! 🎉' : winner === 'o' ? 'המחשב ניצח הפעם' : 'תיקו! 🤝'}
          </h2>
          <button className="btn-primary" onClick={() => onDone(progress)}>
            {winner === 'x' ? 'לקחת את הבונוס! 🏆' : 'ממשיכים לאות הבאה ←'}
          </button>
        </>
      ) : (
        <button className="btn-ghost btn-small" style={{ marginTop: 14 }} onClick={onSkip}>
          לדלג ולעבור לאות הבאה ←
        </button>
      )}
    </div>
  );
}
