import { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '../../lib/sound';
import type { MiniGameProps } from './types';

/**
 * "נחשון האותיות" — סנייק מוקטן עם יעד קצר, כדי שלא יאריך את ההפסקה
 * בין הסיבובים. שליטה בהחלקה על המסך, בחצי המקלדת או בכפתורים.
 * המגרש טורואידלי: מי שיוצא מצד אחד נכנס מהצד השני, כך שמפסידים רק
 * מהתנגשות בעצמך — הרבה פחות מתסכל לילדים.
 */
const SIZE = 12;
const TARGET = 8;
const TICK_MS = 190;

type Point = { x: number; y: number };
type Dir = 'up' | 'down' | 'left' | 'right';

const STEP: Record<Dir, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };

function randomFood(taken: Point[]): Point {
  for (;;) {
    const p = { x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) };
    if (!taken.some((t) => t.x === p.x && t.y === p.y)) return p;
  }
}

export default function Snake({ onDone, onSkip }: MiniGameProps) {
  const [snake, setSnake] = useState<Point[]>([{ x: 6, y: 6 }]);
  const [food, setFood] = useState<Point>(() => randomFood([{ x: 6, y: 6 }]));
  const [eaten, setEaten] = useState(0);
  const [dead, setDead] = useState(false);
  const dir = useRef<Dir>('right');
  const pending = useRef<Dir | null>(null);

  const won = eaten >= TARGET;
  const over = won || dead;

  const turn = useCallback((next: Dir) => {
    if (next !== OPPOSITE[dir.current]) pending.current = next;
  }, []);

  useEffect(() => {
    if (over) return;
    const t = setInterval(() => {
      if (pending.current) {
        dir.current = pending.current;
        pending.current = null;
      }
      setSnake((prev) => {
        const step = STEP[dir.current];
        // מגרש טורואידלי — יוצאים מצד אחד ונכנסים מהשני
        const head = {
          x: (prev[0].x + step.x + SIZE) % SIZE,
          y: (prev[0].y + step.y + SIZE) % SIZE
        };
        if (prev.some((s) => s.x === head.x && s.y === head.y)) {
          setDead(true);
          sfx.error();
          return prev;
        }
        const grew = head.x === food.x && head.y === food.y;
        const next = [head, ...prev];
        if (grew) {
          sfx.success();
          setEaten((n) => n + 1);
          setFood(randomFood(next));
        } else {
          next.pop();
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(t);
  }, [food, over]);

  useEffect(() => {
    if (won) sfx.win();
  }, [won]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right'
      };
      const d = map[ev.key];
      if (d) {
        ev.preventDefault();
        turn(d);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [turn]);

  const swipeStart = useRef<Point | null>(null);

  return (
    <div className="center">
      <p className="dim">
        נאכלו {eaten}/{TARGET}
      </p>

      <div
        role="application"
        aria-label="מגרש הנחש — החליקו כדי לכוון"
        onPointerDown={(ev) => (swipeStart.current = { x: ev.clientX, y: ev.clientY })}
        onPointerUp={(ev) => {
          const start = swipeStart.current;
          swipeStart.current = null;
          if (!start) return;
          const dx = ev.clientX - start.x;
          const dy = ev.clientY - start.y;
          if (Math.abs(dx) < 16 && Math.abs(dy) < 16) return;
          turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
        }}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
          gap: 1,
          width: '100%',
          maxWidth: 320,
          aspectRatio: '1',
          margin: '0 auto',
          padding: 4,
          borderRadius: 14,
          border: '1px solid var(--border-glass)',
          background: 'rgba(255,255,255,0.05)',
          touchAction: 'none'
        }}
      >
        {Array.from({ length: SIZE * SIZE }, (_, i) => {
          const x = i % SIZE;
          const y = Math.floor(i / SIZE);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isBody = !isHead && snake.some((s) => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;
          return (
            <div
              key={i}
              style={{
                borderRadius: 3,
                background: isHead
                  ? 'var(--turquoise)'
                  : isBody
                    ? 'rgba(51,214,195,0.55)'
                    : isFood
                      ? 'var(--gold)'
                      : 'transparent'
              }}
            />
          );
        })}
      </div>

      <div className="row" style={{ justifyContent: 'center', marginTop: 10, gap: 6 }}>
        {(
          [
            ['up', '⬆️', 'למעלה'],
            ['left', '⬅️', 'שמאלה'],
            ['down', '⬇️', 'למטה'],
            ['right', '➡️', 'ימינה']
          ] as [Dir, string, string][]
        ).map(([d, icon, label]) => (
          <button key={d} className="btn-small" aria-label={label} onClick={() => turn(d)} disabled={over}>
            {icon}
          </button>
        ))}
      </div>

      {over ? (
        <>
          <h2 style={{ color: won ? 'var(--ok)' : 'var(--coral)' }}>
            {won ? 'נחשון שבע! 🐍' : `התנגשתם — אכלתם ${eaten}`}
          </h2>
          <button className="btn-primary" onClick={() => onDone(eaten / TARGET)}>
            {won ? 'לקחת את הבונוס! 🏆' : 'ממשיכים לאות הבאה ←'}
          </button>
        </>
      ) : (
        <button className="btn-ghost btn-small" style={{ marginTop: 10 }} onClick={onSkip}>
          לדלג ולעבור לאות הבאה ←
        </button>
      )}
    </div>
  );
}
