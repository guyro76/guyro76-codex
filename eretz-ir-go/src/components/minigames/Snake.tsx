import { useEffect, useRef, useState } from 'react';
import { sfx } from '../../lib/sound';
import {
  SIZE,
  TARGET,
  initialState,
  isOver,
  isWon,
  samePoint,
  step,
  swipeDir,
  turn,
  type Dir,
  type SnakeState
} from '../../lib/snake';
import type { MiniGameProps } from './types';

/**
 * "נחשון האותיות".
 *
 * שני דברים שברו את המשחק קודם ותוקנו כאן:
 *
 * 1. **הכיוונים היו הפוכים.** הדף כולו RTL, ורשת CSS בדף RTL מסדרת
 *    עמודות מימין לשמאל — כלומר x=0 הופיע בקצה הימני. "ימינה" הזיז
 *    את הנחש שמאלה על המסך. המגרש מוגדר כאן במפורש `direction: ltr`,
 *    וזו הסיבה היחידה שהוא חורג מכיוון הדף.
 * 2. **האכילה חושבה בתוך פונקציית עדכון של React**, שבמצב פיתוח
 *    מורצת פעמיים — הפרי הוגרל פעמיים והמונה קפץ. כל החישוב עבר
 *    ל-`lib/snake.ts` כפונקציה טהורה, וכאן נשארה רק התצוגה.
 */
const TICK_MS = 260;

export default function Snake({ onDone, onSkip }: MiniGameProps) {
  const [state, setState] = useState<SnakeState>(() => initialState());
  const over = isOver(state);
  const won = isWon(state);

  useEffect(() => {
    if (over) return;
    const t = setInterval(() => setState((prev) => step(prev)), TICK_MS);
    return () => clearInterval(t);
  }, [over]);

  // צלילים מגיבים למצב, ואינם רצים בתוך חישוב המצב עצמו
  const prevEaten = useRef(0);
  useEffect(() => {
    if (state.eaten > prevEaten.current) sfx.success();
    prevEaten.current = state.eaten;
  }, [state.eaten]);
  useEffect(() => {
    if (state.dead) sfx.error();
  }, [state.dead]);
  useEffect(() => {
    if (won) sfx.win();
  }, [won]);

  const go = (d: Dir) => setState((prev) => turn(prev, d));

  useEffect(() => {
    const map: Record<string, Dir> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right'
    };
    const onKey = (ev: KeyboardEvent) => {
      const d = map[ev.key];
      if (!d) return;
      ev.preventDefault();
      setState((prev) => turn(prev, d));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const dpad: [Dir, string, string][] = [
    ['up', '▲', 'למעלה'],
    ['left', '◀', 'שמאלה'],
    ['right', '▶', 'ימינה'],
    ['down', '▼', 'למטה']
  ];

  return (
    <div className="center">
      <p className="dim" aria-live="polite">
        🍎 נאכלו {state.eaten}/{TARGET}
      </p>

      <div
        role="application"
        aria-label="מגרש הנחש — החליקו או השתמשו בחצים כדי לכוון"
        onPointerDown={(ev) => (swipeStart.current = { x: ev.clientX, y: ev.clientY })}
        onPointerUp={(ev) => {
          const start = swipeStart.current;
          swipeStart.current = null;
          if (!start) return;
          const d = swipeDir(ev.clientX - start.x, ev.clientY - start.y);
          if (d) go(d);
        }}
        className="mg-arena snake-arena"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
          gap: 2,
          width: '100%',
          maxWidth: 320,
          aspectRatio: '1',
          margin: '0 auto',
          padding: 6,
          touchAction: 'none',
          // חובה: בלי זה הרשת מתהפכת יחד עם הדף וכל הכיוונים מתחלפים
          direction: 'ltr'
        }}
      >
        {Array.from({ length: SIZE * SIZE }, (_, i) => {
          const p = { x: i % SIZE, y: Math.floor(i / SIZE) };
          const head = samePoint(state.snake[0], p);
          const body = !head && state.snake.some((s) => samePoint(s, p));
          const food = samePoint(state.food, p);
          return (
            <div key={i} className={`mg-cell ${head ? 'head' : body ? 'body' : food ? 'food' : 'empty'}`}>
              {head ? '🐍' : food ? '🍎' : ''}
            </div>
          );
        })}
      </div>

      <div className="dpad" aria-hidden={false}>
        {dpad.map(([d, icon, label]) => (
          <button
            key={d}
            className={`btn-small dpad-${d}`}
            aria-label={label}
            disabled={over}
            onPointerDown={(ev) => {
              ev.preventDefault(); // תגובה מיידית למגע, בלי להמתין ל-click
              go(d);
            }}
            onClick={() => go(d)}
          >
            {icon}
          </button>
        ))}
      </div>

      {over ? (
        <>
          <h2 style={{ color: won ? 'var(--ok)' : 'var(--coral)' }}>
            {won ? 'נחשון שבע! 🐍' : `התנגשתם — אכלתם ${state.eaten}`}
          </h2>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => onDone(state.eaten / TARGET)}>
              {won ? 'לקחת את הבונוס! 🏆' : 'ממשיכים לאות הבאה ←'}
            </button>
            {!won && (
              <button className="btn-small" onClick={() => setState(initialState())}>
                עוד ניסיון 🔁
              </button>
            )}
          </div>
        </>
      ) : (
        <button className="btn-ghost btn-small" style={{ marginTop: 10 }} onClick={onSkip}>
          לדלג ולעבור לאות הבאה ←
        </button>
      )}
    </div>
  );
}
