import { useState } from 'react';
import { useApp } from '../store/appStore';
import TopBar from '../components/TopBar';
import type { GameMode } from '../types';
import { getSetting, setSetting } from '../db/db';

export interface ModeDraft {
  mode: GameMode;
  rounds: number;
  seconds: number;
  powerCards: boolean;
}

/** טיוטת ההגדרות עוברת דרך settings table כדי לשרוד רענון */
export async function loadModeDraft(): Promise<ModeDraft> {
  const raw = await getSetting('modeDraft');
  const parsed = raw ? (JSON.parse(raw) as Partial<ModeDraft>) : {};
  return { mode: parsed.mode ?? 'solo', rounds: parsed.rounds ?? 3, seconds: parsed.seconds ?? 180, powerCards: parsed.powerCards ?? false };
}

export default function ModeSelect() {
  const { navigate, profiles, activeProfile, secondProfile, selectSecondProfile } = useApp();
  const [mode, setMode] = useState<GameMode>('solo');
  const [rounds, setRounds] = useState(3);
  const [seconds, setSeconds] = useState(180);
  const [powerCards, setPowerCards] = useState(false);

  const needsSecond = mode === 'duel' || mode === 'coop' || mode === 'tournament';
  const others = profiles.filter((p) => p.id !== activeProfile?.id);

  const modes: { id: GameMode; icon: string; name: string; desc: string }[] = [
    { id: 'solo', icon: '⏱️', name: 'משחק יחיד', desc: 'לבד נגד השעון — שיפור השיא האישי' },
    { id: 'duel', icon: '⚔️', name: 'דו-קרב', desc: 'שניים על אותו מכשיר, תור אחרי תור' },
    { id: 'coop', icon: '🤝', name: 'שיתוף פעולה', desc: 'ממלאים יחד לוח אחד — ניקוד קבוצתי' },
    { id: 'tournament', icon: '🏆', name: 'טורניר משפחתי', desc: 'כמה סיבובים, טבלה מצטברת וגביע' },
    { id: 'practice', icon: '📖', name: 'תרגול חופשי', desc: 'בלי שעון, עם רמזים — ללמידה' },
    { id: 'blitz', icon: '⚡', name: 'ראש בראש', desc: 'קטגוריה אחת, 45 שניות, כמה שיותר תשובות!' }
  ];

  const start = async () => {
    await setSetting('modeDraft', JSON.stringify({ mode, rounds, seconds, powerCards } satisfies ModeDraft));
    navigate(mode === 'blitz' ? 'blitz' : 'categories');
  };

  return (
    <div className="screen">
      <TopBar title="איך משחקים היום?" />

      <div className="grid">
        {modes.map((m) => (
          <div
            key={m.id}
            className="card clickable"
            role="button"
            tabIndex={0}
            style={mode === m.id ? { borderColor: 'var(--turquoise)', background: 'rgba(51,214,195,0.12)' } : undefined}
            onClick={() => setMode(m.id)}
          >
            <div className="row">
              <span style={{ fontSize: '1.8rem' }} aria-hidden>
                {m.icon}
              </span>
              <div>
                <strong>{m.name}</strong>
                <p className="dim" style={{ margin: 0, fontSize: '0.9rem' }}>
                  {m.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <button className="btn-ghost" style={{ width: '100%' }} onClick={() => navigate('multiplayer-info')}>
          📡 משחק בשני מכשירים (חדר מרוחק) — איך זה עובד?
        </button>
      </div>

      {needsSecond && (
        <div className="card" style={{ marginTop: 14 }}>
          <strong>{mode === 'coop' ? 'עם מי משתפים פעולה?' : 'נגד מי משחקים?'}</strong>
          <div className="row" style={{ marginTop: 10 }}>
            {others.map((p) => (
              <button
                key={p.id}
                className={`chip${secondProfile?.id === p.id ? ' on' : ''}`}
                onClick={() => selectSecondProfile(p)}
              >
                {p.avatar} {p.name}
              </button>
            ))}
            {others.length === 0 && <p className="dim">אין עוד פרופילים — אפשר ליצור אחד במסך הפרופילים</p>}
          </div>
        </div>
      )}

      {mode !== 'blitz' && (
        <div className="card" style={{ marginTop: 14 }}>
          <label className="row spread">
            <span>
              🎴 <strong>קלפי כוח</strong> — ⏳ זמן נוסף, 🔁 החלפת אות, 💡 רמז מתנה, ✖️2 ניקוד כפול
            </span>
            <input
              type="checkbox"
              style={{ width: 28, minHeight: 28 }}
              checked={powerCards}
              onChange={(ev) => setPowerCards(ev.target.checked)}
            />
          </label>
        </div>
      )}

      <div className="card" style={{ marginTop: 14 }}>
        <div className="row spread">
          <label style={{ flex: 1 }}>
            סיבובים
            <select value={rounds} onChange={(ev) => setRounds(Number(ev.target.value))}>
              {[1, 2, 3, 5, 7].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label style={{ flex: 1 }}>
            זמן לסיבוב
            <select value={seconds} onChange={(ev) => setSeconds(Number(ev.target.value))} disabled={mode === 'practice'}>
              <option value={60}>דקה</option>
              <option value={120}>2 דקות</option>
              <option value={180}>3 דקות</option>
              <option value={300}>5 דקות</option>
              <option value={0}>ללא הגבלה</option>
            </select>
          </label>
        </div>
      </div>

      <button
        className="btn-primary"
        style={{ width: '100%', marginTop: 16 }}
        disabled={needsSecond && !secondProfile}
        onClick={() => void start()}
      >
        {mode === 'blitz' ? 'יאללה, לבליץ! ⚡' : 'המשך לבחירת קטגוריות ←'}
      </button>
    </div>
  );
}
