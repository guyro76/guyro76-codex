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
import { db, DEFAULT_PROFILE_NAME, getSetting, setSetting } from '../db/db';
import HowToPlay from '../components/HowToPlay';
import WhatsNewModal from '../components/WhatsNew';
import { WHATS_NEW } from '../data/whatsNew';
import { computeStreak, streakLabel, type StreakInfo } from '../lib/streak';
import { useGame } from '../store/gameStore';
import { hasPlayedBefore, planQuickPlay } from '../lib/quickPlay';

export default function Home() {
  const { activeProfile, navigate, setEditingProfile, customCategories, refreshActive } = useApp();
  const caps = useCapabilities();
  const startMatch = useGame((s) => s.startMatch);
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
  /**
   * "שוב, כמו קודם" — מדלג על ארבעה מסכים ומתחיל מיד את המשחק
   * שהילד שיחק בפעם הקודמת. מוצג רק אחרי משחק אחד: לשחקן חדש אין
   * "כמו קודם", ובשבילו המסלול המלא הוא בדיוק מה שצריך.
   */
  /**
   * בקשת שם, בלי לחסום.
   *
   * הדבר הראשון שילד חדש ראה היה שם של מישהו אחר. מסך שם חוסם
   * בפתיחה היה פותר את זה — אבל גם היה עומד בין ילד לבין המשחק
   * בשנייה הראשונה. כרטיס במסך הבית שואל, ומי שרוצה פשוט מתחיל
   * לשחק ומתעלם.
   */
  /**
   * ההסבר **אינו נפתח מעצמו**.
   *
   * הניסיון הראשון היה חלון שנפתח אוטומטית בכניסה הראשונה, וזה
   * יצא לא נכון משתי סיבות: הוא עומד בין ילד לבין המשחק בשנייה
   * הראשונה, ובאותו מסך כבר יושבת בקשת השם — כלומר שתי הפרעות
   * לפני שמשחקים בכלל. ילד שרוצה לשחק סוגר את שתיהן בלי לקרוא,
   * ואז ההסבר גם הפריע וגם לא הושג.
   *
   * במקום זה: הזמנה בולטת בפעם הראשונה, וכפתור קבוע תמיד. מי
   * שרוצה הסבר מקבל אותו, ומי שרוצה לשחק פשוט משחק.
   */
  const [howTo, setHowTo] = useState(false);
  const [howToSeen, setHowToSeen] = useState(true);
  useEffect(() => {
    void getSetting('howToSeen').then((v) => setHowToSeen(Boolean(v)));
  }, []);
  const openHowTo = () => {
    setHowTo(true);
    setHowToSeen(true);
    void setSetting('howToSeen', '1');
  };

  /**
   * "מה חדש" — פעם אחת אחרי עדכון, **ורק למי שכבר שיחק**.
   * לשחקן חדש זו רשימת שינויים מגרסה שהוא לא הכיר; בשבילו יש
   * "איך משחקים".
   */
  const [whatsNew, setWhatsNew] = useState(false);
  useEffect(() => {
    if (!hasPlayedBefore(activeProfile)) return;
    void getSetting('whatsNewSeen').then((seen) => {
      /**
       * התקנה חדשה **לא** מקבלת "מה חדש": אין "חדש" ביחס לכלום.
       * במקרה כזה נרשמת הגרסה הנוכחית בשקט, וה'מה חדש' הבא — זה
       * שיהיה באמת חדש עבור המשתמש הזה — כן יוצג.
       */
      if (!seen) {
        void setSetting('whatsNewSeen', WHATS_NEW.version);
        return;
      }
      if (seen !== WHATS_NEW.version) setWhatsNew(true);
    });
  }, [activeProfile]);
  const closeWhatsNew = () => {
    setWhatsNew(false);
    void setSetting('whatsNewSeen', WHATS_NEW.version);
  };

  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);
  const needsName = activeProfile?.name === DEFAULT_PROFILE_NAME;

  const saveName = async () => {
    const clean = nameDraft.trim().slice(0, 12);
    if (!clean || !activeProfile?.id || savingName) return;
    setSavingName(true);
    try {
      await db.profiles.update(activeProfile.id, { name: clean });
      await refreshActive();
    } finally {
      setSavingName(false);
    }
  };

  const [quickBusy, setQuickBusy] = useState(false);
  const quickPlay = async () => {
    if (!activeProfile || quickBusy) return;
    setQuickBusy(true);
    try {
      const plan = await planQuickPlay(activeProfile, customCategories, caps.maxRounds);
      // אם משום מה אין תוכנית, המסלול הרגיל תמיד עובד
      if (!plan) {
        navigate('mode-select');
        return;
      }
      startMatch(plan.settings, plan.categories, [activeProfile]);
      navigate('letter-draw');
    } finally {
      setQuickBusy(false);
    }
  };

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

      {howTo && <HowToPlay onClose={() => setHowTo(false)} />}
      {whatsNew && !howTo && <WhatsNewModal onClose={closeWhatsNew} />}

      {/* ההזמנה מופיעה פעם אחת, עד שנכנסים להסבר */}
      {!howToSeen && (
        <button
          className="card clickable center"
          style={{ width: '100%', margin: '0 0 12px' }}
          onClick={openHowTo}
        >
          <strong>❓ פעם ראשונה כאן?</strong>
          <span className="dim" style={{ display: 'block', fontSize: '0.88rem', marginTop: 2 }}>
            הסבר קצר בארבעה עמודים — מה יש במשחק ואיך זוכים
          </span>
        </button>
      )}

      {needsName && (
        <div className="card" style={{ margin: '0 0 12px' }}>
          <strong>👋 איך קוראים לך?</strong>
          <p className="dim" style={{ margin: '4px 0 8px', fontSize: '0.88rem' }}>
            כדי שהמשחק יפנה אליך בשם. אפשר גם פשוט להתחיל לשחק.
          </p>
          <div className="row" style={{ gap: 8 }}>
            <input
              type="text"
              value={nameDraft}
              aria-label="השם שלי"
              placeholder="השם שלי"
              maxLength={12}
              onChange={(ev) => setNameDraft(ev.target.value)}
              onKeyDown={(ev) => ev.key === 'Enter' && void saveName()}
            />
            <button
              className="btn-primary btn-small"
              disabled={!nameDraft.trim() || savingName}
              onClick={() => void saveName()}
            >
              זהו!
            </button>
          </div>
        </div>
      )}

      {hasPlayedBefore(activeProfile) && (
        <button
          className="btn-primary quick-play"
          style={{ width: '100%', margin: '0 0 12px', fontSize: '1.15rem' }}
          onClick={() => void quickPlay()}
        >
          {quickBusy ? 'רגע…' : '▶️ שוב, כמו קודם'}
          {/*
            לא `.dim` כאן: `--text-dim` מכויל לרקע כהה, והכפתור
            הראשי הוא מדרג בהיר. שורת המשנה יורשת את צבע הכפתור
            עצמו ורק מחווירה מעט — כך היא נשארת קריאה בכל שש
            הערכות, בלי צבע קבוע בקוד.
          */}
          <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginTop: 2, opacity: 0.85 }}>
            אותן קטגוריות, אותן הגדרות — ישר לאות
          </span>
        </button>
      )}

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
      {/* ההסבר נשאר זמין תמיד, לא רק בפעם הראשונה */}
      <div className="row center" style={{ justifyContent: 'center' }}>
        <button className="btn-small btn-ghost" onClick={openHowTo}>
          ❓ איך משחקים
        </button>
      </div>
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
