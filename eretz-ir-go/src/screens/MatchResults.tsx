import { useApp } from '../store/appStore';
import { useGame } from '../store/gameStore';
import { useEffect } from 'react';
import { celebrate } from '../lib/persona';
import { sfx } from '../lib/sound';

export default function MatchResults() {
  const { navigate, refreshActive } = useApp();
  const game = useGame();

  const sorted = [...game.players].sort((a, b) => b.totalScore - a.totalScore);
  const winner = sorted[0];
  const isTie = sorted.length > 1 && sorted[0].totalScore === sorted[1].totalScore;
  // שיא אישי חדש = פאנפרה ארוכה; משחק רגיל = צליל ניצחון קצר
  const isRecord = !!winner && winner.totalScore > (winner.profile.bestRoundScore ?? 0) * game.settings.rounds;

  useEffect(() => {
    if (isRecord) sfx.fanfare();
    else sfx.win();
  }, [isRecord]);

  const finish = async (to: 'home' | 'mode-select') => {
    await refreshActive();
    game.reset();
    navigate(to);
  };

  return (
    <div className="screen center">
      <div className="confetti" aria-hidden>
        🎉🏆🎉
      </div>
      <h1>סוף המשחק!</h1>

      {game.coop ? (
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

      <div className="card" style={{ maxWidth: 420, margin: '14px auto' }}>
        {sorted.map((p, i) => (
          <div key={i} className="row spread" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-glass)' }}>
            <span>
              {i === 0 && !game.coop ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '·'} {p.profile.avatar} {p.profile.name}
            </span>
            <strong className="gold">{p.totalScore}</strong>
          </div>
        ))}
        <p className="dim" style={{ fontSize: '0.85rem', marginBottom: 0 }}>
          אותיות ששוחקו: {game.usedLetters.join(', ')}
        </p>
      </div>

      <div className="row" style={{ justifyContent: 'center' }}>
        <button className="btn-primary" onClick={() => void finish('mode-select')}>
          עוד משחק! 🔁
        </button>
        <button onClick={() => void finish('home')}>למסך הבית</button>
      </div>
    </div>
  );
}
