import { useCallback, useEffect, useMemo, useState } from 'react';
import TopBar from '../components/TopBar';
import { useApp } from '../store/appStore';
import { useGame } from '../store/gameStore';
import { useChallenge } from '../store/challengeStore';
import { CATEGORIES } from '../data/categories';
import { challengeTotal } from '../lib/challenge';
import { phraseById } from '../lib/quickChat';
import { sfx } from '../lib/sound';
import { resolveActivePlayer } from '../lib/activePlayer';
import { identityFrom } from '../lib/identity';
import { useAuth } from '../store/authStore';

/**
 * מסך קבלת האתגר.
 *
 * מוצג אחרי פתיחת קישור מחבר, ולפני שהשעון מתחיל לרוץ. הילד רואה
 * מי אתגר אותו, באיזו אות, ומה הניקוד שצריך לנצח — ורק אז מחליט.
 * נפילה ישר לתוך סיבוב מקישור היא בדיוק הדרך להפסיד אתגר בלי
 * להבין מה קרה.
 */
export default function Challenge() {
  const { navigate, activeProfile } = useApp();
  const selectProfile = useApp((s) => s.selectProfile);
  const loadProfiles = useApp((s) => s.loadProfiles);
  const session = useAuth((s) => s.session);
  const incoming = useChallenge((s) => s.incoming);
  const accept = useChallenge((s) => s.accept);
  const clear = useChallenge((s) => s.clear);
  const startMatch = useGame((s) => s.startMatch);
  const rollLetter = useGame((s) => s.rollLetter);
  const beginRound = useGame((s) => s.beginRound);

  /**
   * הקטגוריות מפוענחות מול הרשימה של **הגרסה הזו**. חבר עם גרסה
   * חדשה יותר עלול לשלוח קטגוריה שאצלנו עדיין לא קיימת, ואסור
   * שהמסך ייפול בגללה — היא פשוט יורדת מהאתגר.
   */
  const cats = useMemo(
    () => (incoming?.cats ?? []).map((id) => CATEGORIES.find((c) => c.id === id)).filter((c) => c != null),
    [incoming]
  );

  if (!incoming) {
    return (
      <div className="screen center">
        <TopBar title="🎯 אתגר" back="home" />
        <div className="card" style={{ maxWidth: 420 }}>
          <h3 style={{ marginTop: 0 }}>האתגר כבר לא כאן</h3>
          <p className="dim">אפשר לבקש מהחבר לשלוח את הקישור שוב.</p>
          <button className="btn-primary" onClick={() => navigate('home')}>
            למסך הבית
          </button>
        </div>
      </div>
    );
  }

  const missing = incoming.cats.length - cats.length;

  if (!cats.length) {
    return (
      <div className="screen center">
        <TopBar title="🎯 אתגר" back="home" />
        <div className="card" style={{ maxWidth: 420 }}>
          <h3 style={{ marginTop: 0 }}>הקישור לא מתאים לגרסה הזו</h3>
          <p className="dim">
            נראה שהאתגר נבנה בגרסה חדשה יותר של המשחק. עדכון של האפליקציה אמור לפתור את זה.
          </p>
          <button className="btn-primary" onClick={() => { clear(); navigate('home'); }}>
            למסך הבית
          </button>
        </div>
      </div>
    );
  }

  /**
   * קישור מחבר עוקף את מסך הפתיחה, ושם נפתר בדרך כלל השחקן הפעיל.
   * בלי הפתרון כאן הכפתור "מתחילים" היה לוחץ ולא קורה כלום — בדיוק
   * הכפתור המת שהמשחק הזה לא מרשה לעצמו.
   */
  const ensurePlayer = useCallback(async () => {
    if (activeProfile) return activeProfile;
    const identity = identityFrom(session);
    const player = await resolveActivePlayer(
      identity ? { firstName: identity.firstName, photo: null } : null
    );
    if (!player) return null;
    selectProfile(player);
    await loadProfiles();
    return player;
  }, [activeProfile, session, selectProfile, loadProfiles]);

  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    void ensurePlayer().then((p) => live && setReady(Boolean(p)));
    return () => {
      live = false;
    };
  }, [ensurePlayer]);

  const start = async () => {
    const player = await ensurePlayer();
    if (!player) return;
    const challenge = accept();
    if (!challenge) return;
    sfx.select();

    startMatch(
      {
        mode: 'solo',
        categoryIds: cats.map((c) => c.id),
        roundSeconds: challenge.secs,
        // סיבוב אחד בדיוק — האתגר הוא סיבוב, לא משחק שלם
        rounds: 1,
        difficulty: player.difficulty,
        hintsPerRound: 3,
        // בלי קלפי כוח: שני הצדדים חייבים לשחק את אותו סיבוב בדיוק,
        // אחרת ההשוואה בסוף לא אומרת כלום
        powerCards: false,
        choiceMode: (player.age ?? 8) <= 6
      },
      cats,
      [player]
    );
    // האות אינה מוגרלת — היא נתונה מהאתגר, וזו כל הנקודה
    rollLetter(challenge.letter);
    beginRound();
    navigate('game');
  };

  return (
    <div className="screen center">
      <TopBar title="🎯 אתגר מחבר" back="home" />

      <div className="card challenge-card">
        <p className="dim" style={{ margin: 0 }}>מישהו אתגר אותך</p>
        <h2 className="challenge-by">{incoming.by}</h2>

        {/* מה שהחבר אמר, אם בחר משפט. מגיע כמזהה ולא כטקסט. */}
        {phraseById(incoming.msg) && (
          <p className="quick-chat-said">
            <span aria-hidden>{phraseById(incoming.msg)!.icon}</span> {phraseById(incoming.msg)!.text}
          </p>
        )}

        <div className="challenge-letter" aria-label={`האות ${incoming.letter}`}>
          {incoming.letter}
        </div>

        <p className="challenge-beat">
          צריך לעבור <strong className="gold">{challengeTotal(incoming)}</strong> נקודות
        </p>

        <ul className="challenge-cats">
          {cats.map((c) => (
            <li key={c.id}>
              <span aria-hidden>{c.icon}</span> {c.name}
            </li>
          ))}
        </ul>

        <p className="dim" style={{ fontSize: '0.86rem', margin: 0 }}>
          {incoming.secs ? `${incoming.secs} שניות` : 'בלי הגבלת זמן'} · אותה אות ואותן קטגוריות
        </p>

        {missing > 0 && (
          <p className="dim" style={{ fontSize: '0.82rem', margin: 0 }}>
            {missing === 1 ? 'קטגוריה אחת' : `${missing} קטגוריות`} מהאתגר לא קיימות בגרסה שלך והושמטו.
          </p>
        )}
      </div>

      <button
        className="btn-primary"
        style={{ fontSize: '1.15rem', padding: '14px 40px' }}
        disabled={!ready}
        onClick={() => void start()}
      >
        {ready ? 'מתחילים! 🚀' : 'רגע…'}
      </button>

      <button className="btn-ghost" onClick={() => { clear(); navigate('home'); }}>
        אולי אחר כך
      </button>
    </div>
  );
}
