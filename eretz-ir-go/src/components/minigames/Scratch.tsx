import { useMemo, useState } from 'react';
import { sfx } from '../../lib/sound';
import type { MiniGameProps } from './types';

/**
 * "כרטיס גירוד" בסגנון הגרלה — אבל בלי שום היבט של הימורים אמיתיים:
 * אין כסף אמיתי, אין קנייה, אין הפסד ואין "עוד ניסיון בתשלום".
 * מגרדים שלושה שדות מתוך שישה, ואם שלושה סמלים זהים מתגלים —
 * זוכים בבונוס המלא. אחרת מקבלים בונוס חלקי לפי כמה התקרבתם.
 *
 * הכרטיס מוגרל מראש והתוצאה קבועה מרגע הפתיחה: מה שמתגלה הוא מה
 * שהיה שם מלכתחילה, בלי שהמשחק "מחליט" תוך כדי.
 */
const SYMBOLS = ['🍀', '⭐', '💎', '🍒', '🔔', '🎁'];
const PICKS = 3;

/** כרטיס עם סיכוי סביר לזכייה — שליש מהכרטיסים מנצחים */
function buildCard(): string[] {
  const cells: string[] = [];
  if (Math.random() < 0.34) {
    const winner = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    cells.push(winner, winner, winner);
    while (cells.length < 6) {
      const other = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      if (other !== winner) cells.push(other);
    }
  } else {
    // כרטיס מפסיד: לכל היותר שני סמלים זהים
    const counts = new Map<string, number>();
    while (cells.length < 6) {
      const s = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const n = counts.get(s) ?? 0;
      if (n >= 2) continue;
      counts.set(s, n + 1);
      cells.push(s);
    }
  }
  return cells.sort(() => Math.random() - 0.5);
}

export default function Scratch({ onDone, onSkip }: MiniGameProps) {
  const card = useMemo(buildCard, []);
  const [revealed, setRevealed] = useState<number[]>([]);

  const picked = revealed.map((i) => card[i]);
  const done = revealed.length >= PICKS;
  const counts = picked.reduce<Record<string, number>>((acc, s) => {
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});
  const best = Math.max(0, ...Object.values(counts));
  const won = done && best === PICKS;

  const scratch = (i: number) => {
    if (done || revealed.includes(i)) return;
    const next = [...revealed, i];
    setRevealed(next);
    if ('vibrate' in navigator) navigator.vibrate?.(12);
    if (next.length < PICKS) sfx.tick();
    else if (new Set(next.map((k) => card[k])).size === 1) sfx.win();
    else sfx.error();
  };

  /** שלושה זהים = מלא, שניים זהים = חצי, אחרת מעט */
  const progress = won ? 1 : best === 2 ? 0.5 : 0.2;

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
          <button className="btn-primary" onClick={() => onDone(progress)}>
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
