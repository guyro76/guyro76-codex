import { useMemo, useState } from 'react';
import { sfx } from '../../lib/sound';
import { PICKS, bestStreak, buildCard, progressFor } from '../../lib/scratchCard';
import type { MiniGameProps } from './types';

/**
 * "כרטיס גירוד" בסגנון הגרלה — אבל בלי שום היבט של הימורים אמיתיים:
 * אין כסף אמיתי, אין קנייה, אין הפסד ואין "עוד ניסיון בתשלום".
 * מגרדים שלושה שדות מתוך שישה, ואם שלושה סמלים זהים מתגלים —
 * זוכים בבונוס המלא. אחרת מקבלים בונוס חלקי לפי כמה התקרבתם.
 *
 * הכרטיס מוגרל מראש (ראו lib/scratchCard) והתוצאה קבועה מרגע הפתיחה.
 */
export default function Scratch({ onDone, onSkip }: MiniGameProps) {
  const card = useMemo(() => buildCard(), []);
  const [revealed, setRevealed] = useState<number[]>([]);

  const picked = revealed.map((i) => card[i]);
  const done = revealed.length >= PICKS;
  const best = bestStreak(picked);
  const won = done && best >= PICKS;

  const scratch = (i: number) => {
    if (done || revealed.includes(i)) return;
    const next = [...revealed, i];
    setRevealed(next);
    if ('vibrate' in navigator) navigator.vibrate?.(12);
    if (next.length < PICKS) sfx.tick();
    else if (new Set(next.map((k) => card[k])).size === 1) sfx.win();
    else sfx.error();
  };

  return (
    <div className="center">
      <p className="dim">
        מגרדים {PICKS} שדות · נחשפו {revealed.length}/{PICKS}
        {done && !won && ' · לא הפעם'}
      </p>

      <div
        className="mg-board"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 320 }}
      >
        {card.map((symbol, i) => {
          const open = revealed.includes(i);
          return (
            <button
              key={i}
              className="mg-bubble"
              style={{
                ['--mg-color' as string]: open ? '#fff3c4' : '#c9a7ff',
                borderRadius: 14,
                fontSize: '1.9rem'
              }}
              aria-label={open ? `נחשף ${symbol}` : `שדה גירוד ${i + 1}`}
              disabled={done || open}
              onClick={() => scratch(i)}
            >
              {open ? symbol : '🪙'}
            </button>
          );
        })}
      </div>

      {done ? (
        <>
          <h2 style={{ color: won ? 'var(--ok)' : 'var(--gold)' }}>
            {won ? 'שלושה זהים — זכייה! 🎉' : best === 2 ? 'שניים זהים — כמעט!' : 'לא הפעם, אבל יש בונוס קטן'}
          </h2>
          <button className="btn-primary" onClick={() => onDone(progressFor(picked))}>
            {won ? 'לקחת את הפרס! 🏆' : 'ממשיכים לאות הבאה ←'}
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
