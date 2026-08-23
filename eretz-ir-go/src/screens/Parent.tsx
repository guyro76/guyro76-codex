import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import Avatar from '../components/Avatar';
import { db, getSetting, setSetting } from '../db/db';
import { useApp } from '../store/appStore';
import { otherProfiles } from '../lib/activePlayer';
import { normalizeHebrew } from '../lib/hebrew';
import { CATEGORIES } from '../data/categories';

interface Appeal {
  key: string;
  text: string;
  categoryId: string;
  letter: string;
}

/** מצב הורה: מוגן ב-PIN, אישור ערעורים וניהול המאגר המקומי */
export default function Parent() {
  const { profiles, activeProfile, selectProfile, navigate } = useApp();
  const others = otherProfiles(profiles, activeProfile);
  const [pinSet, setPinSet] = useState<string | null>(null);
  const [entered, setEntered] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [userWords, setUserWords] = useState<{ id?: number; canonicalName: string; categoryId: string; source: string }[]>([]);

  useEffect(() => {
    void getSetting('parentPin').then((v) => setPinSet(v ?? null));
  }, []);

  const loadData = async () => {
    const all = await db.settings.toArray();
    setAppeals(
      all
        .filter((s) => s.key.startsWith('appeal-'))
        .map((s) => ({ key: s.key, ...(JSON.parse(s.value) as Omit<Appeal, 'key'>) }))
    );
    setUserWords(await db.userKnowledge.toArray());
  };

  const unlock = async () => {
    if (pinSet == null) {
      if (entered.length < 4) return;
      await setSetting('parentPin', entered);
      setPinSet(entered);
      setUnlocked(true);
      await loadData();
    } else if (entered === pinSet) {
      setUnlocked(true);
      await loadData();
    } else {
      alert('קוד שגוי');
      setEntered('');
    }
  };

  const approveAppeal = async (a: Appeal) => {
    await db.userKnowledge.add({
      canonicalName: a.text,
      normalized: normalizeHebrew(a.text),
      categoryId: a.categoryId,
      source: 'parent-approved',
      addedAt: new Date().toISOString()
    });
    await db.settings.delete(a.key);
    await loadData();
  };

  const rejectAppeal = async (a: Appeal) => {
    await db.settings.delete(a.key);
    await loadData();
  };

  if (!unlocked) {
    return (
      <div className="screen center">
        <TopBar title="🔒 מצב הורה" />
        <div className="card" style={{ maxWidth: 380, margin: '0 auto' }}>
          <p>{pinSet == null ? 'בחרו קוד PIN (לפחות 4 ספרות) להגנת אזור ההורים:' : 'הזינו את קוד ההורה:'}</p>
          <input
            type="password"
            inputMode="numeric"
            value={entered}
            aria-label="קוד הורה"
            onChange={(ev) => setEntered(ev.target.value.replace(/\D/g, '').slice(0, 8))}
            onKeyDown={(ev) => ev.key === 'Enter' && void unlock()}
          />
          <button className="btn-primary" style={{ marginTop: 10, width: '100%' }} disabled={entered.length < 4} onClick={() => void unlock()}>
            {pinSet == null ? 'קביעת קוד' : 'כניסה'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <TopBar title="🔓 מצב הורה" />

      <div className="card" style={{ marginBottom: 14 }}>
        <strong>⚖️ ערעורים ממתינים ({appeals.length})</strong>
        <p className="dim" style={{ fontSize: '0.88rem' }}>
          תשובות שהילדים ביקשו לאשר ולא נמצאו במאגר או באינטרנט
        </p>
        {appeals.map((a) => {
          const cat = CATEGORIES.find((c) => c.id === a.categoryId);
          return (
            <div key={a.key} className="row spread" style={{ padding: '8px 0', borderTop: '1px solid var(--border-glass)' }}>
              <span>
                <strong>{a.text}</strong> <span className="dim">({cat?.name ?? a.categoryId}, האות {a.letter})</span>
              </span>
              <span className="row">
                <button className="btn-small btn-gold" onClick={() => void approveAppeal(a)}>
                  ✔ אישור
                </button>
                <button className="btn-small" onClick={() => void rejectAppeal(a)}>
                  ✖ דחייה
                </button>
              </span>
            </div>
          );
        })}
        {appeals.length === 0 && <p className="dim">אין ערעורים ממתינים 🎉</p>}
      </div>

      <div className="card">
        <strong>📚 ניהול המאגר המקומי — מילים שנוספו ({userWords.length})</strong>
        <p className="dim" style={{ fontSize: '0.88rem' }}>
          מילים שאושרו אונליין (ויקיפדיה) או על ידי הורה. אפשר להסיר מילה שאינה מתאימה.
        </p>
        {userWords.map((w) => (
          <div key={w.id} className="row spread" style={{ padding: '6px 0', borderTop: '1px solid var(--border-glass)' }}>
            <span>
              {w.canonicalName} <span className="dim">({CATEGORIES.find((c) => c.id === w.categoryId)?.name ?? w.categoryId})</span>
              <span className="dim" style={{ fontSize: '0.75rem' }}> · מקור: {w.source === 'parent-approved' ? 'אישור הורה' : 'ויקיפדיה'}</span>
            </span>
            <button className="btn-small" onClick={() => w.id && void db.userKnowledge.delete(w.id).then(loadData)}>
              🗑️
            </button>
          </div>
        ))}
        {userWords.length === 0 && <p className="dim">עדיין לא נוספו מילים חדשות למאגר</p>}
      </div>

      {/* מכשיר שהיה בשימוש לפני שהיו חשבונות יכול להחזיק עוד פרופילים.
          הם לא נמחקו — התקדמות של ילד שנעלמת היא אובדן נתונים ולא
          ניקיון — אבל הם גם לא מוצגים לילד שנכנס. כאן, מאחורי ה-PIN,
          הורה יכול להעביר את המכשיר לשחקן אחר. */}
      {others.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <strong>👥 שחקנים נוספים במכשיר</strong>
          <p className="dim" style={{ margin: '4px 0 10px', fontSize: '0.88rem' }}>
            נשמרו מהתקופה שבה כמה ילדים שיחקו על אותו מכשיר. הילד שמשחק לא רואה
            אותם — רק אתם, כאן.
          </p>
          {others.map((p) => (
            <div key={p.id} className="row spread" style={{ marginBottom: 8 }}>
              <span className="row" style={{ gap: 8 }}>
                <Avatar avatar={p.avatar} photo={p.photo} name={p.name} size={28} />
                <strong>{p.name}</strong>
                <span className="dim" style={{ fontSize: '0.85rem' }}>
                  {p.gamesPlayed} משחקים
                </span>
              </span>
              <button
                className="btn-small"
                onClick={() => {
                  selectProfile(p);
                  navigate('home');
                }}
              >
                החלפה
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginTop: 14 }}>
        <strong>🔑 החלפת קוד PIN</strong>
        <button
          className="btn-small"
          style={{ marginTop: 8 }}
          onClick={() => {
            void setSetting('parentPin', '').then(() => {
              setPinSet(null);
              setUnlocked(false);
              setEntered('');
            });
          }}
        >
          איפוס הקוד (יידרש קוד חדש)
        </button>
      </div>
    </div>
  );
}
