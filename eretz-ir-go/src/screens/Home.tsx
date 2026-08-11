import { useMemo } from 'react';
import { useApp } from '../store/appStore';
import { greeting, randomJoke } from '../lib/persona';
import { tipOfTheDay } from '../data/tips';
import { todayKey } from '../lib/daily';
import WalletChip from '../components/WalletChip';
import { authAvailable } from '../store/authStore';

export default function Home() {
  const { activeProfile, navigate } = useApp();
  const joke = useMemo(() => (activeProfile ? randomJoke(activeProfile.age) : ''), [activeProfile]);

  if (!activeProfile) {
    navigate('profiles');
    return null;
  }

  const items = [
    { icon: '🎮', label: 'משחק חדש', to: 'mode-select' as const, primary: true },
    { icon: '📅', label: 'האתגר היומי', to: 'daily' as const },
    { icon: '🃏', label: 'אוסף המילים שלי', to: 'album' as const },
    { icon: '🏆', label: 'לוח השיאים', to: 'leaderboard' as const },
    { icon: '🎖️', label: 'הישגים', to: 'achievements' as const },
    { icon: '⚙️', label: 'הגדרות', to: 'settings' as const }
  ];

  return (
    <div className="screen">
      <div className="row spread" style={{ paddingTop: 8 }}>
        <div className="row">
          <div className="avatar-big" style={{ width: 54, height: 54, fontSize: '1.6rem', borderColor: activeProfile.color }}>
            {activeProfile.avatar}
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{greeting(activeProfile)}</h2>
            <p className="dim" style={{ margin: 0, fontSize: '0.9rem' }}>
              🔥 רצף יומי: {activeProfile.dailyStreak} · 🏅 {activeProfile.wins} ניצחונות
            </p>
            <div style={{ marginTop: 6 }}>
              <WalletChip profileId={activeProfile.id} />
            </div>
          </div>
        </div>
        <button className="btn-small btn-ghost" onClick={() => navigate('profiles')}>
          החלפת שחקן
        </button>
      </div>

      <div className="card" style={{ margin: '14px 0' }}>
        <span aria-hidden>🤖</span> <strong>ארצי:</strong> {joke}
      </div>

      <div className="grid grid-2">
        {items.map((item) => (
          <button
            key={item.to}
            className={item.primary ? 'btn-primary' : 'card clickable'}
            style={{ minHeight: 92, fontSize: '1.1rem', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', justifyContent: 'center' }}
            onClick={() => navigate(item.to)}
          >
            <span style={{ fontSize: '2rem' }} aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </div>

      <p className="dim center" style={{ marginTop: 18, fontSize: '0.9rem' }}>
        💡 {tipOfTheDay(todayKey())}
      </p>
      <div className="row center" style={{ justifyContent: 'center' }}>
        <button className="btn-small btn-ghost" onClick={() => navigate('credits')}>
          מקורות וקרדיטים
        </button>
        <button className="btn-small btn-ghost" onClick={() => navigate('privacy')}>
          פרטיות
        </button>
        <button className="btn-small btn-ghost" onClick={() => navigate('parent')}>
          🔒 מצב הורה
        </button>
        {authAvailable() && (
          <button className="btn-small btn-ghost" onClick={() => navigate('account')}>
            👤 החשבון שלי
          </button>
        )}
      </div>
    </div>
  );
}
