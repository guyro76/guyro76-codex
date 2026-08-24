import { useEffect, useState } from 'react';
import Avatar from '../components/Avatar';
import { useApp } from '../store/appStore';
import { useCapabilities } from '../store/authStore';
import RivalsCard from '../components/RivalsCard';
import { greeting } from '../lib/persona';
import { tipOfTheDay } from '../data/tips';
import { todayKey } from '../lib/daily';
import WalletChip from '../components/WalletChip';
import InstallPrompt from '../components/InstallPrompt';
import Artzi from '../components/Artzi';
import { authAvailable, useAuth } from '../store/authStore';
import { db } from '../db/db';
import { computeStreak, streakLabel, type StreakInfo } from '../lib/streak';

export default function Home() {
  const { activeProfile, navigate, setEditingProfile } = useApp();
  const caps = useCapabilities();
  // פאנל הניהול הוסתר קודם מאחורי כפתור רפאים זעיר בתחתית המסך, ואחריו
  // עוד מסך — מנהל שנכנס פשוט לא מצא אותו. עכשיו הוא כרטיס משלו.
  const isAdmin = useAuth((s) => s.account?.role === 'admin');

  // רצף ימי המשחק של השחקן הנוכחי, מחושב מהמשחקים ששמורים במכשיר
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const profileId = activeProfile?.id;
  useEffect(() => {
    if (!profileId) return;
    let live = true;
    void db.matches
      .toArray()
      .then((rows) =>
        rows.filter((m) => m.playerIds.includes(profileId)).map((m) => m.playedAt)
      )
      .then((dates) => {
        if (live) setStreak(computeStreak(dates));
      })
      .catch(() => undefined); // אחסון חסום — פשוט בלי רצף, המשחק ממשיך
    return () => {
      live = false;
    };
  }, [profileId]);

  if (!activeProfile) {
    // אין שחקן — חוזרים לפתיחה, שם הוא נבחר או נוצר. הפניה ל-home
    // הייתה לולאה אינסופית: זה המסך הזה עצמו.
    navigate('splash');
    return null;
  }

  /**
   * התפריט נגזר מהחבילה.
   *
   * בגרסה החינמית מוסתרים הפאזלים וההישגים — הם לא קיימים בה, ותפריט
   * שמוביל למסך ריק גרוע יותר מתפריט קצר. מה שכן מוצג הוא כפתור אחד
   * שמסביר מה יש בגרסה המלאה.
   */
  const items = [
    { icon: '🎮', label: 'משחק חדש', to: 'mode-select' as const, primary: true },
    { icon: '📅', label: 'האתגר היומי', to: 'daily' as const },
    { icon: '🃏', label: 'אוסף המילים שלי', to: 'album' as const },
    ...(caps.puzzles ? [{ icon: '🧩', label: 'הפאזלים שלי', to: 'puzzles' as const }] : []),
    { icon: '🏆', label: 'לוח השיאים', to: 'leaderboard' as const },
    ...(caps.rewards ? [{ icon: '🎖️', label: 'הישגים', to: 'achievements' as const }] : []),
    { icon: '⚙️', label: 'הגדרות', to: 'settings' as const },
    ...(caps.id === 'free' ? [{ icon: '💎', label: 'מה יש בגרסה המלאה', to: 'pricing' as const }] : [])
  ];

  return (
    <div className="screen">
      <div className="row spread" style={{ paddingTop: 8 }}>
        <div className="row">
          <div className="avatar-big" style={{ width: 54, height: 54, fontSize: '1.6rem', borderColor: activeProfile.color }}>
            <Avatar avatar={activeProfile.avatar} photo={activeProfile.photo} name={activeProfile.name} size={48} />
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{greeting(activeProfile)}</h2>
            {/* הדרישה: שיהיה רשום לשחקן שסוג המשחק הוא גרסת חינם */}
            {caps.id === 'free' && <span className="free-badge">גרסת חינם</span>}
            <p className="dim" style={{ margin: 0, fontSize: '0.9rem' }}>
              🔥 רצף יומי: {activeProfile.dailyStreak} · 🏅 {activeProfile.wins} ניצחונות
            </p>
            {/* הארנק שייך לפרסים, ובגרסה החינמית אין כאלה */}
            {caps.rewards && (
              <div style={{ marginTop: 6 }}>
                <WalletChip profileId={activeProfile.id} />
              </div>
            )}
          </div>
        </div>
        <button
          className="btn-small btn-ghost"
          onClick={() => {
            setEditingProfile(activeProfile.id ?? null);
            navigate('profile-edit');
          }}
        >
          ✏️ הפרופיל שלי
        </button>
      </div>

      <InstallPrompt />

      {streak && streak.current > 0 && (
        <div className={`card streak-chip${streak.atRisk ? ' at-risk' : ''}`} style={{ margin: '14px 0 0' }}>
          <span style={{ fontSize: '1.5rem' }} aria-hidden>
            🔥
          </span>{' '}
          <strong>{streakLabel(streak)}</strong>
          {streak.longest > streak.current && (
            <span className="dim" style={{ display: 'block', fontSize: '0.84rem', marginTop: 2 }}>
              השיא שלכם: {streak.longest} ימים
            </span>
          )}
        </div>
      )}

      {/* היריבות מוצגת מעל התפריט: היא הסיבה שילד פותח את המשחק
          שוב, ולא פריט ניווט בין פריטים */}
      {caps.multiplayer && <RivalsCard />}

      {isAdmin && (
        <button
          className="card clickable admin-banner"
          style={{ width: '100%', margin: '14px 0 0', textAlign: 'start' }}
          onClick={() => navigate('admin')}
        >
          <span style={{ fontSize: '1.6rem' }} aria-hidden>
            🛠️
          </span>{' '}
          <strong>קונסולת הניהול</strong>
          <span className="dim" style={{ display: 'block', fontSize: '0.86rem', marginTop: 2 }}>
            הזמנות, משתמשים וחבילות
          </span>
        </button>
      )}

      <div style={{ margin: '14px 0' }}>
        <Artzi />
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
