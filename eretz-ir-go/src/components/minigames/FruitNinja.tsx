import { useEffect, useRef, useState } from 'react';
import { sfx } from '../../lib/sound';
import type { MiniGameProps } from './types';

/**
 * "נינג׳ה פירות" — מעבירים את האצבע על הפירות המרחפים וחותכים את כולם
 * לפני שהזמן נגמר. אין להבים ואין פצצות מפחידות — רק פירות וקצת קליפות.
 * עובד במגע וגם בעכבר.
 */
const DURATION_MS = 20_000;
const FRUITS = ['🍉', '🍎', '🍌', '🍇', '🍊', '🥝', '🍓', '🍍'];
const COUNT = 12;

interface Fruit {
  id: number;
  emoji: string;
  x: number; // אחוזים
  y: number;
  vx: number;
  vy: number;
  sliced: boolean;
}

export default function FruitNinja({ onDone, onSkip }: MiniGameProps) {
  const [fruits, setFruits] = useState<Fruit[]>(() =>
    Array.from({ length: COUNT }, (_, id) => ({
      id,
      emoji: FRUITS[Math.floor(Math.random() * FRUITS.length)],
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      sliced: false
    }))
  );
  const [msLeft, setMsLeft] = useState(DURATION_MS);
  const [slicing, setSlicing] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);

  const sliced = fruits.filter((f) => f.sliced).length;
  const won = sliced === COUNT;
  const over = won || msLeft <= 0;

  // תנועה + שעון
  useEffect(() => {
    if (over) return;
    const t = setInterval(() => {
      setFruits((prev) =>
        prev.map((f) => {
          if (f.sliced) return f;
          let { x, y, vx, vy } = f;
          x += vx;
          y += vy;
          if (x < 4 || x > 96) vx = -vx;
          if (y < 4 || y > 96) vy = -vy;
          return { ...f, x: Math.max(4, Math.min(96, x)), y: Math.max(4, Math.min(96, y)), vx, vy };
        })
      );
      setMsLeft((ms) => Math.max(0, ms - 50));
    }, 50);
    return () => clearInterval(t);
  }, [over]);

  useEffect(() => {
    if (won) sfx.win();
  }, [won]);

  /** חיתוך: כל פרי שהמגע עובר קרוב אליו מספיק */
  const sliceAt = (clientX: number, clientY: number) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect || over) return;
    const px = ((clientX - rect.left) / rect.width) * 100;
    const py = ((clientY - rect.top) / rect.height) * 100;
    setFruits((prev) => {
      let hit = false;
      const next = prev.map((f) => {
        if (f.sliced) return f;
        if (Math.hypot(f.x - px, f.y - py) < 9) {
          hit = true;
          return { ...f, sliced: true };
        }
        return f;
      });
      if (hit) {
        sfx.tick();
        if ('vibrate' in navigator) navigator.vibrate?.(12);
      }
      return next;
    });
  };

  return (
    <div className="center">
      <p className="dim">
        נחתכו {sliced}/{COUNT} · ⏱️ {Math.ceil(msLeft / 1000)} שניות
      </p>

      <div
        ref={areaRef}
        role="application"
        aria-label="אזור חיתוך הפירות"
        onPointerDown={(ev) => {
          setSlicing(true);
          sliceAt(ev.clientX, ev.clientY);
        }}
        onPointerMove={(ev) => slicing && sliceAt(ev.clientX, ev.clientY)}
        onPointerUp={() => setSlicing(false)}
        onPointerLeave={() => setSlicing(false)}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 360,
          aspectRatio: '1',
          margin: '0 auto',
          borderRadius: 18,
          border: '1px solid var(--border-glass)',
          background: 'rgba(255,255,255,0.05)',
          overflow: 'hidden',
          touchAction: 'none',
          cursor: 'crosshair'
        }}
      >
        {fruits.map((f) => (
          <span
            key={f.id}
            aria-hidden
            style={{
              position: 'absolute',
              left: `${f.x}%`,
              top: `${f.y}%`,
              transform: `translate(-50%, -50%) scale(${f.sliced ? 0.55 : 1})`,
              fontSize: '2rem',
              opacity: f.sliced ? 0.35 : 1,
              filter: f.sliced ? 'grayscale(1)' : undefined,
              transition: 'transform 140ms ease, opacity 140ms ease',
              pointerEvents: 'none'
            }}
          >
            {f.sliced ? '🥣' : f.emoji}
          </span>
        ))}
      </div>

      {over ? (
        <>
          <h2 style={{ color: won ? 'var(--ok)' : 'var(--coral)' }}>
            {won ? 'חתכתם הכול! 🥷' : `נגמר הזמן — חתכתם ${sliced}`}
          </h2>
          <button className="btn-primary" onClick={() => onDone(sliced / COUNT)}>
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
