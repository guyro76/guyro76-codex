import { useEffect, useRef, useState } from 'react';
import { useApp } from '../store/appStore';
import { useGame } from '../store/gameStore';
import { GAME_LETTERS } from '../lib/hebrew';
import { roundIntro } from '../lib/persona';
import { primeAudio, sfx } from '../lib/sound';

export default function LetterDraw() {
  const { navigate, activeProfile } = useApp();
  const rollLetter = useGame((s) => s.rollLetter);
  const beginRound = useGame((s) => s.beginRound);
  const roundIndex = useGame((s) => s.roundIndex);
  const settings = useGame((s) => s.settings);
  const dailyLetter = useGame((s) => s.dailyDate); // באתגר יומי האות כבר נקבעה
  const fixedLetter = useGame((s) => s.letter);
  const categories = useGame((s) => s.categories);
  const power = useGame((s) => s.power);
  const usePower = useGame((s) => s.usePower);

  const [display, setDisplay] = useState('א');
  const [spinning, setSpinning] = useState(false);
  const [finalLetter, setFinalLetter] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  /** סך הצעדים של הגלגל; הקצב מאט בהדרגה כדי שהעצירה תרגיש אמיתית */
  const SPIN_STEPS = 22;

  const spin = () => {
    if (spinning) return;
    // הלחיצה הזו היא מחווה של המשתמש — הרגע היחיד שבו iOS מרשה
    // לפתוח AudioContext. משחררים כאן כדי שגם צליל הסיבוב יישמע.
    primeAudio();
    setSpinning(true);
    setFinalLetter(null);
    // באתגר היומי משתמשים באות שכבר הוגדרה
    const target = dailyLetter && fixedLetter ? fixedLetter : rollLetter();
    sfx.spinStart();

    let step = 0;
    const tick = () => {
      step++;
      const progress = step / SPIN_STEPS;
      setDisplay(GAME_LETTERS[Math.floor(Math.random() * GAME_LETTERS.length)]);
      sfx.spinTick(progress);
      // רטט קל אחת לכמה צעדים — רצף מלא מרגיש מציק ביד
      if (step % 3 === 0 && 'vibrate' in navigator) navigator.vibrate?.(8);

      if (step >= SPIN_STEPS) {
        setDisplay(target);
        setFinalLetter(target);
        setSpinning(false);
        sfx.select();
        if ('vibrate' in navigator) navigator.vibrate?.([40, 60, 90]);
        return;
      }
      if (step === SPIN_STEPS - 6) sfx.spinSlow();
      // האטה: מ-55ms בהתחלה עד ~230ms בצעד האחרון
      timerRef.current = setTimeout(tick, 55 + Math.round(175 * progress * progress));
    };
    timerRef.current = setTimeout(tick, 55);
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
          {settings.mode === 'mystery' && (
            <div className="card" style={{ maxWidth: 420, margin: '0 auto 12px', borderColor: 'var(--gold)' }}>
              <strong>🎴 הקלפים נחשפים!</strong>
              <div className="row" style={{ justifyContent: 'center', marginTop: 8 }}>
                {categories.map((c) => (
                  <span key={c.id} className="chip on">
                    {c.icon} {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}
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
