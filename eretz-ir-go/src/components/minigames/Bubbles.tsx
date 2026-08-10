import { useMemo, useState } from 'react';
import { sfx } from '../../lib/sound';
import type { MiniGameProps } from './types';

/**
 * "שקית פצפצים" — מפוצצים את כל הבועות שיש בהן פירות.
 * בועה ריקה עולה חיים; זה מכריח להסתכל לפני שלוחצים ולא רק לרסס לחיצות.
 * הכול לחיצות בלבד — עובד מצוין באצבע על טלפון.
 */
const FRUITS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍑', '🍍', '🥝'];
const ROWS = 5;
const COLS = 6;
const LIVES = 3;

interface Bubble {
  fruit: string | null;
  popped: boolean;
}

export default function Bubbles({ onDone, onSkip }: MiniGameProps) {
  const initial = useMemo<Bubble[]>(() => {
    const cells: Bubble[] = Array.from({ length: ROWS * COLS }, () => ({ fruit: null, popped: false }));
    // בערך שני שלישים מהבועות מכילות פרי
    const withFruit = Math.round(cells.length * 0.62);
    const order = cells.map((_, i) => i).sort(() => Math.random() - 0.5);
    for (const idx of order.slice(0, withFruit)) {
      cells[idx] = { fruit: FRUITS[Math.floor(Math.random() * FRUITS.length)], popped: false };
    }
    return cells;
  }, []);

  const [bubbles, setBubbles] = useState(initial);
  const [lives, setLives] = useState(LIVES);

  const totalFruit = initial.filter((b) => b.fruit).length;
  const poppedFruit = bubbles.filter((b) => b.fruit && b.popped).length;
  const won = poppedFruit === totalFruit;
  const lost = lives <= 0 && !won;
  const over = won || lost;

  const pop = (idx: number) => {
    if (over || bubbles[idx].popped) return;
    const bubble = bubbles[idx];
    setBubbles((prev) => prev.map((b, i) => (i === idx ? { ...b, popped: true } : b)));
    if (bubble.fruit) {
      sfx.tick();
      if ('vibrate' in navigator) navigator.vibrate?.(10);
    } else {
      sfx.error();
      setLives((l) => l - 1);
    }
  };

  return (
    <div className="center">
      <p className="dim">
        פירות: {poppedFruit}/{totalFruit} · חיים: {'❤️'.repeat(Math.max(0, lives)) || '—'}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: 6,
          maxWidth: 340,
          margin: '0 auto'
        }}
      >
        {bubbles.map((b, i) => (
          <button
            key={i}
            aria-label={b.popped ? 'בועה שפוצצה' : 'בועה'}
            onClick={() => pop(i)}
            disabled={over || b.popped}
            style={{
              aspectRatio: '1',
              minHeight: 0,
              padding: 0,
              fontSize: '1.4rem',
              borderRadius: '50%',
              border: '1px solid var(--border-glass)',
              background: b.popped
                ? b.fruit
                  ? 'rgba(61,220,132,0.18)'
                  : 'rgba(255,92,92,0.18)'
                : 'radial-gradient(circle at 32% 30%, rgba(255,255,255,0.45), rgba(255,255,255,0.1))',
              transform: b.popped ? 'scale(0.86)' : undefined,
              transition: 'transform 120ms ease'
            }}
          >
            {b.popped ? (b.fruit ?? '💨') : ''}
          </button>
        ))}
      </div>

      {over ? (
        <>
          <h2 style={{ color: won ? 'var(--ok)' : 'var(--coral)' }}>
            {won ? 'פוצצתם הכול! 🎉' : 'נגמרו החיים — אבל צברתם פירות!'}
          </h2>
          <button
            className="btn-primary"
            onClick={() => {
              if (won) sfx.win();
              onDone(totalFruit === 0 ? 0 : poppedFruit / totalFruit);
            }}
          >
            {won ? 'לקחת את הבונוס! 🏆' : 'ממשיכים לאות הבאה ←'}
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
