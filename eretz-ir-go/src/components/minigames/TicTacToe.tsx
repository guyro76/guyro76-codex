import { useEffect, useState } from 'react';
import { sfx } from '../../lib/sound';
import { computerMove, isFull, progressFor, winnerOf, type Cell } from '../../lib/ticTacToe';
import type { MiniGameProps } from './types';

/**
 * איקס-עיגול מול המחשב. כל הלוגיקה של היריב יושבת ב-lib/ticTacToe
 * ונבדקת שם; כאן רק הלוח והתורות.
 */
export default function TicTacToe({ onDone, onSkip }: MiniGameProps) {
  const [board, setBoard] = useState<Cell[]>(() => Array(9).fill(null));
  const [busy, setBusy] = useState(false);

  const winner = winnerOf(board);
  const over = winner !== null || isFull(board);

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
    if (winnerOf(next) || isFull(next)) return;

    // תור המחשב, עם השהיה קטנה כדי שיורגש כמו יריב ולא כמו מחשבון
    setBusy(true);
    setTimeout(() => {
      setBoard((current) => {
        if (winnerOf(current) || isFull(current)) return current;
        const after = [...current];
        after[computerMove(after)] = 'o';
        return after;
      });
      setBusy(false);
    }, 420);
  };

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
          <button className="btn-primary" onClick={() => onDone(progressFor(winner))}>
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
