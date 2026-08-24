import { useApp } from '../store/appStore';
import Avatar from '../components/Avatar';
import Podium from '../components/Podium';
import { useGame } from '../store/gameStore';
import { useEffect, useState } from 'react';
import { celebrate } from '../lib/persona';
import { sfx } from '../lib/sound';
import { buildShareText, shareText, type ShareOutcome } from '../lib/share';
import ChallengeInvite from '../components/ChallengeInvite';
import ChallengeResult from '../components/ChallengeResult';
import { useChallenge } from '../store/challengeStore';

export default function MatchResults() {
  const { navigate, refreshActive } = useApp();
  const game = useGame();
  const activeChallenge = useChallenge((s) => s.active);
  const clearChallenge = useChallenge((s) => s.clear);

  const sorted = [...game.players].sort((a, b) => b.totalScore - a.totalScore);
  const winner = sorted[0];
  const isTie = sorted.length > 1 && sorted[0].totalScore === sorted[1].totalScore;
  // שיא אישי חדש = פאנפרה ארוכה; משחק רגיל = צליל ניצחון קצר
  const isRecord = !!winner && winner.totalScore > (winner.profile.bestRoundScore ?? 0) * game.settings.rounds;

  useEffect(() => {
    // באתגר הצליל נקבע לפי התוצאה מול החבר, ומושמע ב-ChallengeResult.
    // בלי התנאי הזה מי שהפסיד באתגר היה שומע פאנפרת ניצחון.
    if (activeChallenge) return;
    if (isRecord) sfx.fanfare();
    else sfx.win();
  }, [isRecord, activeChallenge]);

  const [shareState, setShareState] = useState<ShareOutcome | null>(null);

  /**
   * השיתוף נבנה מקומית ונמסר למערכת ההפעלה. שום דבר לא עובר דרכנו,
   * ושום דבר לא נשלח בלי הלחיצה הזו.
   */
  const share = async () => {
    // התשובות השמורות הן של הסיבוב האחרון בלבד, ולכן הנוסח בשיתוף
    // הוא "מילה מקורית במיוחד" ולא "המילה הכי מקורית במשחק"
    const best = game.players
      .flatMap((p) => p.submitted)
      .filter((a) => a.validation.status === 'valid')
      .sort((a, b) => b.originality - a.originality)[0];

    const outcome = await shareText(
      buildShareText({
        scores: sorted.map((p) => ({ name: p.profile.name, score: p.totalScore })),
        letters: game.usedLetters,
        rounds: game.settings.rounds,
        coop: game.coop,
        bestWord: best ? { text: best.rawText, originality: best.originality } : undefined
      })
    );
    setShareState(outcome);
    if (outcome === 'shared' || outcome === 'copied') sfx.success();
  };

  const finish = async (to: 'home' | 'mode-select') => {
    await refreshActive();
    game.reset();
    // בלי הניקוי הזה תוצאת האתגר הייתה מופיעה שוב בסוף המשחק הבא
    clearChallenge();
    navigate(to);
  };

  return (
    <div className="screen center">
      {/* קונפטי הוא הצהרת ניצחון. באתגר הוא מוצג רק כשבאמת ניצחנו,
          ולכן הוא נקבע שם ולא כאן */}
      {!activeChallenge && (
        <div className="confetti" aria-hidden>
          🎉🏆🎉
        </div>
      )}
      <h1>{activeChallenge ? 'סוף האתגר!' : 'סוף המשחק!'}</h1>

      {/* תוצאת האתגר קודמת לכל השאר: מי שהגיע לכאן מקישור של חבר
          בא לראות מספר אחד, ולא את הפודיום של משחק יחיד */}
      <ChallengeResult />

      {/* באתגר ההכרעה היא ההשוואה מול החבר, ולכן כרטיס ה"ניצחון!"
          הרגיל מוסתר: הוא מברך על סיום סיבוב יחיד, והיה מופיע גם
          למי שהפסיד באתגר — בדיוק מעל השורה שאומרת שהוא הפסיד */}
      {activeChallenge ? null : game.coop ? (
        <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
          <h2>ציון הצוות: <span className="gold">{game.players[0].totalScore}</span></h2>
          <p>כל הכבוד! עבדתם יחד כמו צוות אמיתי 🤝</p>
        </div>
      ) : isTie ? (
        <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
          <h2>תיקו! 🤝</h2>
          <p>שניכם אלופים — סיבוב הכרעה?</p>
        </div>
      ) : (
        winner && (
          <div className="card" style={{ maxWidth: 420, margin: '0 auto', borderColor: 'var(--gold)' }}>
            <div style={{ fontSize: '3.4rem' }} aria-hidden>
              🏆
            </div>
            <h2>{celebrate(winner.profile)}</h2>
          </div>
        )
      )}

      {/* פודיום רק כשבאמת יש דירוג.
          בשיתוף פעולה אין מקומות, במשחק יחיד אין מול מי, ובתיקו אין
          מקום ראשון — פודיום שמציב אחד מהשניים על המדרגה הגבוהה
          סותר את "שניכם אלופים" שמופיע ממש מעליו. */}
      {!game.coop && !isTie && sorted.length > 1 && <Podium players={sorted} />}

      {/* באתגר הכרטיס הזה מיותר וגם מטעה: הוא מציג מדליית זהב לשחקן
          היחיד במכשיר — כולל למי שהרגע הפסיד — וחוזר על האות
          שכבר מופיעה בכרטיס ההשוואה */}
      {!activeChallenge && (
      <div className="card" style={{ maxWidth: 420, margin: '14px auto' }}>
        {/* מי שלא עלה לפודיום עדיין מופיע כאן — משחק של חמישה שחקנים
            לא אמור להעלים את הרביעי והחמישי */}
        {sorted.map((p, i) => (
          <div key={i} className="row spread" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-glass)' }}>
            <span>
              {i === 0 && !game.coop ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}{' '}
              <Avatar avatar={p.profile.avatar} photo={p.profile.photo} name={p.profile.name} size={26} /> {p.profile.name}
            </span>
            <strong className="gold">{p.totalScore}</strong>
          </div>
        ))}
        <p className="dim" style={{ fontSize: '0.85rem', marginBottom: 0 }}>
          אותיות ששוחקו: {game.usedLetters.join(', ')}
        </p>
      </div>
      )}

      <ChallengeInvite />

      <div className="row" style={{ justifyContent: 'center' }}>
        <button className="btn-primary" onClick={() => void finish('mode-select')}>
          עוד משחק! 🔁
        </button>
        <button onClick={() => void share()}>שיתוף התוצאה 📤</button>
        <button onClick={() => void finish('home')}>למסך הבית</button>
      </div>

      {shareState && shareState !== 'cancelled' && (
        <p className={shareState === 'failed' ? 'bad' : 'dim'} role="status" style={{ marginTop: 10 }}>
          {shareState === 'copied'
            ? '✅ התוצאה הועתקה — אפשר להדביק בכל מקום'
            : shareState === 'shared'
              ? '✅ שותף!'
              : 'לא הצלחנו לשתף מהמכשיר הזה'}
        </p>
      )}
    </div>
  );
}
