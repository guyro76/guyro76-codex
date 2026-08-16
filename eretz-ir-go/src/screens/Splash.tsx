import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../store/appStore';
import { useAuth } from '../store/authStore';
import { tipOfTheDay } from '../data/tips';
import { todayKey } from '../lib/daily';
import { identityFrom, photoAsDataUri } from '../lib/identity';
import { db, getSetting, setSetting } from '../db/db';
import { getInstallEvent, onInstallChange, runInstallPrompt } from '../lib/installPrompt';
import Avatar from '../components/Avatar';
import type { Profile } from '../types';

/** מפתח המטמון לתמונת הפרופיל של המשתמש המחובר */
const photoKey = (email: string) => `identity-photo:${email}`;

export default function Splash() {
  const navigate = useApp((s) => s.navigate);
  const loadProfiles = useApp((s) => s.loadProfiles);
  const session = useAuth((s) => s.session);
  const identity = identityFrom(session);

  const [installEvent, setInstallEvent] = useState(() => getInstallEvent());
  useEffect(() => onInstallChange(() => setInstallEvent(getInstallEvent())), []);

  const [photo, setPhoto] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [creating, setCreating] = useState(false);

  /**
   * תמונת הפרופיל מגוגל מורדת **פעם אחת** ונשמרת במכשיר כ-data URI.
   * מכאן והלאה היא מוצגת בלי שום פנייה לגוגל — גם כדי שתעבוד
   * אופליין, וגם כדי לא לחשוף את כתובת ה-IP של הילד בכל טעינת מסך.
   */
  useEffect(() => {
    if (!identity?.email) return;
    let live = true;
    const key = photoKey(identity.email);

    void getSetting(key).then(async (cached) => {
      if (!live) return;
      if (cached) {
        setPhoto(cached);
        return;
      }
      if (!identity.photoUrl) return;
      const data = await photoAsDataUri(identity.photoUrl);
      if (!live || !data) return;
      setPhoto(data);
      await setSetting(key, data);
    });

    return () => {
      live = false;
    };
  }, [identity?.email, identity?.photoUrl]);

  // האם כבר קיים שחקן בשם הזה? אם כן, אין מה להציע
  useEffect(() => {
    if (!identity) return;
    let live = true;
    void db.profiles
      .toArray()
      .then((rows) => {
        if (live) setHasProfile(rows.some((p) => p.name.trim() === identity.firstName));
      })
      .catch(() => setHasProfile(true)); // אחסון חסום — לא מציעים ליצור
    return () => {
      live = false;
    };
  }, [identity?.firstName]);

  /** יוצר שחקן בשם ובתמונה של החשבון, ונכנס איתו ישר למשחק */
  const createFromIdentity = useCallback(async () => {
    if (!identity) return;
    setCreating(true);
    const profile: Omit<Profile, 'id'> = {
      name: identity.firstName,
      avatar: photo ?? '🙂',
      color: '#7c5cff',
      gender: 'other',
      age: 11,
      difficulty: 'medium',
      soundOn: true,
      reducedMotion: false,
      favoriteCategories: [],
      totalScore: 0,
      wins: 0,
      gamesPlayed: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      originalitySum: 0,
      bestRoundScore: 0,
      dailyStreak: 0,
      lastDailyDate: '',
      achievements: [],
      createdAt: new Date().toISOString()
    };
    await db.profiles.add(profile as Profile);
    await loadProfiles();
    setCreating(false);
    navigate('profiles');
  }, [identity, photo, navigate, loadProfiles]);

  return (
    <div className="screen center" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: '4.5rem' }} aria-hidden>
        🌍🏙️
      </div>
      <h1
        style={{
          fontSize: '2.6rem',
          background: 'linear-gradient(90deg,#33d6c3,#7c5cff,#ff5c8a)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent'
        }}
      >
        ארץ-עיר GO!
      </h1>

      {identity ? (
        <div className="hello-row">
          {photo && <Avatar avatar={photo} name={identity.fullName} size={54} />}
          <div>
            <div className="hello-greeting">שלום, {identity.fullName}! 👋</div>
            <p className="dim" style={{ margin: 0, fontSize: '0.9rem' }}>
              טוב לראות אתכם. המשחק עובד גם בלי אינטרנט.
            </p>
          </div>
        </div>
      ) : (
        <p className="dim">המשחק הקלאסי — בגרסה חכמה, מהירה וכיפית. עובד גם בלי אינטרנט!</p>
      )}

      {identity && hasProfile === false && (
        <div className="card" style={{ margin: '14px auto 0', maxWidth: 420 }}>
          <strong>ליצור שחקן בשם {identity.firstName}?</strong>
          <p className="dim" style={{ margin: '4px 0 10px', fontSize: '0.88rem' }}>
            {photo
              ? 'נשתמש בשם ובתמונה מהחשבון שלכם. אפשר לשנות הכול אחר כך.'
              : 'אפשר לשנות את השם, האווטאר והגיל בכל רגע.'}
          </p>
          <button className="btn-primary" disabled={creating} onClick={() => void createFromIdentity()}>
            {creating ? 'רגע…' : `כן, ליצור את ${identity.firstName} 🎮`}
          </button>
        </div>
      )}

      <div className="card" style={{ margin: '18px auto', maxWidth: 420 }}>
        <strong>💡 טיפ יומי:</strong> {tipOfTheDay(todayKey())}
      </div>

      <button
        className="btn-primary"
        style={{ fontSize: '1.3rem', padding: '14px 44px' }}
        onClick={() => navigate('profiles')}
      >
        בואו נשחק! 🚀
      </button>

      {installEvent && (
        <button className="btn-ghost" style={{ marginTop: 14 }} onClick={() => void runInstallPrompt()}>
          📲 התקנת המשחק במסך הבית
        </button>
      )}
    </div>
  );
}
