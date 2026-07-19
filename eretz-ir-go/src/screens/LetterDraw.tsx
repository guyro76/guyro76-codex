import { useEffect, useRef, useState } from 'react';
import { useApp } from '../store/appStore';
import { useGame } from '../store/gameStore';
import { GAME_LETTERS } from '../lib/hebrew';
import { roundIntro } from '../lib/persona';
import { sfx } from '../lib/sound';

export default function LetterDraw() {
  const { navigate, activeProfile } = useApp();
  const rollLetter = useGame((s) => s.rollLetter);
  const beginRound = useGame((s) => s.beginRound);
  const roundIndex = useGame((s) => s.roundIndex);
  const settings = useGame((s) => s.settings);
  const dailyLetter = useGame((s) => s.dailyDate); // באתגר יומי האות כבר נקבעה
  const fixedLetter = useGame((s) => s.letter);
  const power = useGame((s) => s.power);
  const usePower = useGame((s) => s.usePower);

  const [display, setDisplay] = useState('א');
  const [spinning, setSpinning] = useState(false);
  const [finalLetter, setFinalLetter] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setFinalLetter(null);
    // באתגר היומי משתמשים באות שכבר הוגדרה
    const target = dailyLetter && fixedLetter ? fixedLetter : rollLetter();
    let ticks = 0;
    timerRef.current = setInterval(() => {
      ticks++;
      setDisplay(GAME_LETTERS[Math.floor(Math.random() * GAME_LETTERS.length)]);
      if (ticks > 18) {
        if (timerRef.current) clearInterval(timerRef.current);
        setDisplay(target);
        setFinalLetter(target);
        setSpinning(false);
        sfx.letter();
        if ('vibrate' in navigator) navigator.vibrate?.(60);
      }
    }, 90);
  };

  return (
    <div className="screen center">
      <h1>
        סיבוב {roundIndex + 1} מתוך {settings.rounds}
      </h1>
      <p className="dim">לוחצים על הגלגל להגרלת האות!</p>

      <div
        className={`letter-wheel${spinning ? ' spinning' : ''}${finalLetter ? ' landed' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="גלגל הגרלת אות"
        onClick={spin}
        onKeyDown={(ev) => ev.key === 'Enter' && spin()}
        style={{ cursor: 'pointer' }}
      >
        <div className="inner">{display}</div>
      </div>

      {finalLetter && activeProfile && (
        <>
          <div className="card" style={{ maxWidth: 420, margin: '0 auto 16px', whiteSpace: 'pre-line' }}>
            <span aria-hidden>🤖</span> {roundIntro(activeProfile, finalLetter, roundIndex === 0)}
          </div>
          <button
            className="btn-primary"
            style={{ fontSize: '1.2rem', padding: '14px 40px' }}
            onClick={() => {
              beginRound();
              navigate('game');
            }}
          >
            מתחילים! ⏱️
          </button>
          {settings.powerCards && !power.swap && !dailyLetter && (
            <div style={{ marginTop: 10 }}>
              <button
                className="btn-ghost btn-small"
                onClick={() => {
                  if (usePower('swap')) {
                    sfx.power();
                    spin();
                  }
                }}
              >
                🎴 קלף כוח: החלפת אות (פעם אחת במשחק)
              </button>
            </div>
          )}
        </>
      )}
      {!finalLetter && !spinning && (
        <button className="btn-gold" onClick={spin}>
          🎡 הגרלת אות
        </button>
      )}
    </div>
  );
}
