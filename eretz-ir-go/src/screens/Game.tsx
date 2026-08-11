import { useEffect, useRef, useState } from 'react';
import { useApp } from '../store/appStore';
import { useGame } from '../store/gameStore';
import CategoryCard from '../components/CategoryCard';
import { say } from '../lib/persona';
import { sfx } from '../lib/sound';
import WalletChip from '../components/WalletChip';
import { announce } from '../lib/announce';

export default function Game() {
  const { navigate } = useApp();
  const game = useGame();
  const [secondsLeft, setSecondsLeft] = useState(game.settings.roundSeconds);
  const finishing = useRef(false);

  const isDuel = game.settings.mode === 'duel' || game.settings.mode === 'tournament';
  const playerIdx = game.coop ? 0 : game.currentPlayerIdx;
  const player = game.players[playerIdx];
  const activePlayerProfile = game.players[game.currentPlayerIdx]?.profile;

  // טיימר
  useEffect(() => {
    if (game.settings.roundSeconds <= 0 || game.phase !== 'playing') return;
    setSecondsLeft(Math.max(0, game.settings.roundSeconds - Math.floor((Date.now() - game.roundStartedAt) / 1000)));
    const t = setInterval(() => {
      const left = Math.max(0, game.settings.roundSeconds - Math.floor((Date.now() - game.roundStartedAt) / 1000));
      setSecondsLeft(left);
      if (left <= 0) clearInterval(t);
    }, 500);
    return () => clearInterval(t);
  }, [game.roundStartedAt, game.settings.roundSeconds, game.phase]);

  // סיום אוטומטי כשנגמר הזמן — אין שליחה אחרי הזמן.
  // הזמן שנותר מחושב כאן מחדש ולא נלקח מ-secondsLeft: כשמדליקים את
  // השעון באמצע סיבוב, הערך השמור עדיין 0 לרנדר אחד — והסיבוב היה
  // נסגר מיד במקום להתחיל לספור.
  useEffect(() => {
    if (game.settings.roundSeconds <= 0 || game.phase !== 'playing' || finishing.current) return;
    const left = game.settings.roundSeconds - Math.floor((Date.now() - game.roundStartedAt) / 1000);
    if (left > 0) return;
    finishing.current = true;
    void game.finishPlayer().then(() => {
      finishing.current = false;
    });
  }, [secondsLeft, game]);

  // הזמן שאוזל מסומן בצבע ובפעימה בלבד — מכריזים אותו בנקודות בודדות
  // ולא בכל שנייה, כדי לא להציף את קורא המסך באמצע ההקלדה
  const announcedAt = useRef<number | null>(null);
  useEffect(() => {
    if (game.settings.roundSeconds <= 0 || game.phase !== 'playing') return;
    for (const mark of [30, 10]) {
      if (secondsLeft <= mark && (announcedAt.current == null || announcedAt.current > mark)) {
        announcedAt.current = mark;
        announce(`נותרו ${mark} שניות`);
        return;
      }
    }
  }, [secondsLeft, game.settings.roundSeconds, game.phase]);

  // סיבוב חדש מאפס את נקודות ההכרזה
  useEffect(() => {
    announcedAt.current = null;
  }, [game.roundStartedAt]);

  // ניווט לפי שלב המשחק
  useEffect(() => {
    if (game.phase === 'passing') navigate('pass-device');
    if (game.phase === 'round-done') navigate('round-results');
  }, [game.phase, navigate]);

  if (!player || !activePlayerProfile) {
    navigate('home');
    return null;
  }

  const min = Math.floor(secondsLeft / 60);
  const sec = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="screen">
      <div className="row spread" style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(27,16,53,0.85)', backdropFilter: 'blur(8px)', padding: '10px 0', borderRadius: 12 }}>
        <div className="row">
          <span
            className="avatar-big"
            style={{ width: 44, height: 44, fontSize: '1.3rem', borderColor: activePlayerProfile.color }}
            aria-hidden
          >
            {activePlayerProfile.avatar}
          </span>
          <div>
            <strong>{activePlayerProfile.name}</strong>
            {game.coop && game.players[1] && (
              <span className="dim"> + {game.players[1].profile.name} (יחד!)</span>
            )}
            <div
              className="round-letter"
              aria-label={`האות של הסיבוב: ${game.letter}`}
              style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}
            >
              {game.letter}
            </div>
          </div>
        </div>
        <div className="row">
          <WalletChip profileId={activePlayerProfile.id} />
          <span className="chip" aria-label={`נשארו ${game.hintsLeft} רמזים`}>💡 {game.hintsLeft}</span>
          {/* התצוגה והכפתור מופרדים: השעון מתעדכן כל שנייה, והכפתור
              נשאר יציב כדי שאפשר יהיה ללחוץ עליו תוך כדי ספירה. */}
          {game.settings.roundSeconds > 0 ? (
            <span className={`timer${secondsLeft <= 20 ? ' low' : ''}`} role="timer" style={{ minWidth: '4.2rem' }}>
              {min}:{sec}
            </span>
          ) : (
            <span className="chip">♾️ בלי לחץ</span>
          )}
          {/* מעבר בין משחק על זמן למשחק בלי לחץ — זמין גם תוך כדי הסיבוב */}
          <button
            className="chip"
            aria-label="החלפת מצב זמן"
            aria-pressed={game.settings.roundSeconds > 0}
            title={game.settings.roundSeconds > 0 ? 'לכבות את השעון' : 'להדליק את השעון'}
            onClick={() => game.setTimed(game.settings.roundSeconds <= 0)}
          >
            ⏱️
          </button>
        </div>
      </div>

      {game.settings.powerCards && (
        <div className="row" style={{ marginTop: 10 }} aria-label="קלפי כוח">
          <button
            className="btn-small btn-gold"
            disabled={game.power.extraTime || game.settings.roundSeconds <= 0}
            onClick={() => {
              if (game.usePower('extraTime')) sfx.power();
            }}
          >
            ⏳ +15 שניות
          </button>
          <button
            className="btn-small btn-gold"
            disabled={game.power.freeHint}
            onClick={() => {
              if (game.usePower('freeHint')) sfx.power();
            }}
          >
            💡 רמז מתנה
          </button>
          <span className="chip" style={{ fontSize: '0.82rem' }}>
            {game.power.double
              ? `✖️2 על ${game.categories.find((c) => c.id === game.power.double!.categoryId)?.name ?? ''}`
              : '✖️2 — סמנו קטגוריה עם כפתור ה-×2 בקלף'}
          </span>
        </div>
      )}

      {isDuel && (
        <p className="dim center" style={{ margin: '8px 0' }}>
          🙈 {say('write', activePlayerProfile.gender)} בשקט — התשובות מוסתרות מהשחקן השני עד סוף הסיבוב
        </p>
      )}

      <div className="cats-grid" style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {game.categories.map((cat) => {
          // בשיתוף פעולה: צבע לפי מי שמחזיקה בקלף (לסירוגין לפי אינדקס — פשוט והוגן)
          const editorColor = game.coop && game.players.length > 1 ? undefined : undefined;
          return (
            <CategoryCard
              key={cat.id}
              category={cat}
              draft={player.answers[cat.id]}
              profileId={activePlayerProfile.id}
              gender={activePlayerProfile.gender}
              letter={game.letter}
              editorColor={editorColor}
            />
          );
        })}
      </div>

      <button
        className="btn-coral"
        style={{ width: '100%', marginTop: 18, fontSize: '1.2rem' }}
        disabled={game.phase !== 'playing'}
        onClick={() => {
          if (finishing.current) return;
          finishing.current = true;
          void game.finishPlayer().then(() => {
            finishing.current = false;
          });
        }}
      >
        {game.phase === 'validating' ? 'בודקים את התשובות… 🔍' : 'סיימתי! ✋'}
      </button>
    </div>
  );
}
