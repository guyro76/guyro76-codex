import { useMemo, useState } from 'react';
import { GAME_LETTERS } from '../../lib/hebrew';
import { sfx } from '../../lib/sound';
import type { MiniGameProps } from './types';

/**
 * "נחשו את המילה" — גרסה ידידותית לילדים של המשחק התלוי:
 * אין דמות נתלית, יש בלונים שמתפוצצים. המילה נלקחת ממאגר המשחק עצמו,
 * כך שגם המשימה הזו מלמדת אוצר מילים.
 */
const TRIES = 7;

export default function Hangman({ words, onDone, onSkip }: MiniGameProps) {
  const word = useMemo(() => {
    const pool = words.filter((w) => w.length >= 3 && w.length <= 9 && /^[א-ת ]+$/.test(w));
    const source = pool.length > 0 ? pool : ['ישראל', 'דולפין', 'תפוח'];
    return source[Math.floor(Math.random() * source.length)];
  }, [words]);

  const [picked, setPicked] = useState<Set<string>>(new Set());
  const letters = useMemo(() => new Set(word.replace(/ /g, '').split('')), [word]);

  const wrong = [...picked].filter((l) => !letters.has(l)).length;
  const found = [...letters].filter((l) => picked.has(l)).length;
  const won = found === letters.size;
  const lost = wrong >= TRIES && !won;
  const over = won || lost;

  const guess = (letter: string) => {
    if (over || picked.has(letter)) return;
    setPicked((prev) => new Set(prev).add(letter));
    if (letters.has(letter)) sfx.success();
    else sfx.error();
  };

  const finish = () => {
    if (won) sfx.win();
    onDone(won ? 1 : found / letters.size);
  };

  return (
    <div className="center">
      <p className="dim">בלונים שנשארו: {'🎈'.repeat(Math.max(0, TRIES - wrong)) || '—'}</p>

      <div
        className="row"
        style={{ justifyContent: 'center', gap: 6, fontSize: '1.9rem', fontWeight: 800, direction: 'rtl' }}
      >
        {word.split('').map((ch, i) =>
          ch === ' ' ? (
            <span key={i} style={{ width: 14 }} />
          ) : (
            <span
              key={i}
              style={{
                minWidth: 30,
                borderBottom: '3px solid var(--border-glass)',
                color: picked.has(ch) || over ? 'var(--turquoise)' : 'transparent'
              }}
            >
              {picked.has(ch) || over ? ch : '·'}
            </span>
          )
        )}
      </div>

      {!over && (
        <div className="row" style={{ flexWrap: 'wrap', justifyContent: 'center', marginTop: 14, gap: 6 }}>
          {GAME_LETTERS.map((l) => (
            <button
              key={l}
              className="btn-small"
              disabled={picked.has(l)}
              onClick={() => guess(l)}
              style={{
                minWidth: 40,
                opacity: picked.has(l) ? 0.35 : 1,
                borderColor: picked.has(l) && !letters.has(l) ? 'var(--bad)' : undefined
              }}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {over && (
        <>
          <h2 style={{ color: won ? 'var(--ok)' : 'var(--coral)' }}>
            {won ? 'ניחשתם! 🎉' : `כמעט! המילה הייתה "${word}"`}
          </h2>
          <button className="btn-primary" onClick={finish}>
            {won ? 'לקחת את הבונוס! 🏆' : 'ממשיכים לאות הבאה ←'}
          </button>
        </>
      )}

      {!over && (
        <button className="btn-ghost btn-small" style={{ marginTop: 14 }} onClick={onSkip}>
          לדלג ולעבור לאות הבאה ←
        </button>
      )}
    </div>
  );
}
