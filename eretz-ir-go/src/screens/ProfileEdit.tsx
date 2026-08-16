import { useEffect, useState } from 'react';
import { DEFAULT_AGE, clampAge, sanitizeAgeInput } from '../lib/ageField';
import { useApp } from '../store/appStore';
import TopBar from '../components/TopBar';
import { db, deleteProfileData, exportProfile } from '../db/db';
import type { Difficulty, Gender, Profile } from '../types';

const AVATARS = ['🦄', '🐬', '🦁', '🐼', '🦊', '🐙', '🦜', '🐯', '🌟', '⚽', '🎨', '🚀'];
const COLORS = ['#33d6c3', '#ff5c9d', '#7c5cff', '#ffd75c', '#5cff8f', '#ff8a5c'];

export default function ProfileEdit() {
  const { editingProfileId, navigate, loadProfiles, refreshActive } = useApp();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [color, setColor] = useState(COLORS[0]);
  // אין ברירת מחדל למגדר: מי שלא בוחר היה מקבל פנייה בלשון נקבה
  // בלי ששאלו אותו. הבחירה נדרשת לפני שמירה.
  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState(DEFAULT_AGE);
  /** מה שמוקלד כרגע. נשמר כטקסט כדי שהשדה לא ייכתב מחדש באמצע ההקלדה */
  const [ageText, setAgeText] = useState(String(DEFAULT_AGE));
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (editingProfileId == null) return;
    void db.profiles.get(editingProfileId).then((p) => {
      if (!p) return;
      setName(p.name);
      setAvatar(p.avatar);
      setColor(p.color);
      setGender(p.gender);
      setAge(p.age);
      setAgeText(String(p.age));
      setDifficulty(p.difficulty);
    });
  }, [editingProfileId]);

  const save = async () => {
    if (!name.trim() || !gender) return;
    if (editingProfileId != null) {
      await db.profiles.update(editingProfileId, {
        name: name.trim(),
        avatar,
        color,
        gender,
        age: clampAge(ageText, age),
        difficulty
      });
    } else {
      const fresh: Profile = {
        name: name.trim(),
        avatar,
        color,
        gender,
        age: clampAge(ageText, age),
        difficulty,
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
      await db.profiles.add(fresh);
    }
    await loadProfiles();
    await refreshActive();
    navigate('profiles');
  };

  return (
    <div className="screen">
      <TopBar title={editingProfileId != null ? 'עריכת פרופיל' : 'פרופיל חדש'} back="profiles" />

      <div className="card grid" style={{ gap: 16 }}>
        <label>
          שם או כינוי
          <input type="text" value={name} onChange={(ev) => setName(ev.target.value)} placeholder="למשל: אורי" maxLength={20} />
        </label>

        <div>
          <p style={{ margin: '0 0 6px' }}>אווטאר</p>
          <div className="row">
            {AVATARS.map((a) => (
              <button
                key={a}
                className="chip"
                aria-pressed={a === avatar}
                style={a === avatar ? { borderColor: 'var(--turquoise)', fontSize: '1.4rem' } : { fontSize: '1.4rem' }}
                onClick={() => setAvatar(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p style={{ margin: '0 0 6px' }}>צבע אישי</p>
          <div className="row">
            {COLORS.map((c) => (
              <button
                key={c}
                aria-label={`צבע ${c}`}
                style={{
                  width: 44,
                  height: 44,
                  minHeight: 44,
                  borderRadius: '50%',
                  padding: 0,
                  background: c,
                  border: c === color ? '4px solid white' : '2px solid transparent'
                }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <div>
          <p style={{ margin: '0 0 6px' }}>
            איך לפנות אליך? (המשחק ידבר בהתאם){' '}
            {!gender && <span className="status-text-pending">— חובה לבחור</span>}
          </p>
          <div className="row">
            <button className={`chip${gender === 'girl' ? ' on' : ''}`} onClick={() => setGender('girl')}>
              👧 בת
            </button>
            <button className={`chip${gender === 'boy' ? ' on' : ''}`} onClick={() => setGender('boy')}>
              👦 בן
            </button>
            <button className={`chip${gender === 'other' ? ' on' : ''}`} onClick={() => setGender('other')}>
              🙂 אחר
            </button>
          </div>
        </div>

        <label>
          גיל (המשחק יתבדח בהתאם 😉)
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            value={ageText}
            onChange={(ev) => setAgeText(sanitizeAgeInput(ev.target.value))}
            onBlur={() => {
              const n = clampAge(ageText, age);
              setAge(n);
              setAgeText(String(n));
            }}
          />
        </label>

        <div>
          <p style={{ margin: '0 0 6px' }}>רמת קושי</p>
          <div className="row">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <button key={d} className={`chip${difficulty === d ? ' on' : ''}`} onClick={() => setDifficulty(d)}>
                {d === 'easy' ? '🌱 קל' : d === 'medium' ? '🌿 בינוני' : '🌳 קשה'}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={() => void save()} disabled={!name.trim() || !gender}>
          שמירה ✔
        </button>

        {editingProfileId != null && (
          <>
            <button
              className="btn-ghost"
              onClick={() =>
                void exportProfile(editingProfileId).then((json) => {
                  const blob = new Blob([json], { type: 'application/json' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = `eretz-ir-profile-${name || 'profile'}.json`;
                  a.click();
                  URL.revokeObjectURL(a.href);
                })
              }
            >
              📤 ייצוא פרופיל לקובץ
            </button>
            {!confirmDelete ? (
              <button className="btn-ghost" style={{ color: 'var(--bad)' }} onClick={() => setConfirmDelete(true)}>
                🗑️ מחיקת הפרופיל וכל המידע שלו
              </button>
            ) : (
              <div className="card" style={{ borderColor: 'var(--bad)' }}>
                <p>למחוק לגמרי את הפרופיל, המילים והתוצאות? אי אפשר לבטל.</p>
                <div className="row">
                  <button
                    className="btn-coral"
                    onClick={() =>
                      void deleteProfileData(editingProfileId).then(async () => {
                        await loadProfiles();
                        navigate('profiles');
                      })
                    }
                  >
                    כן, למחוק הכול
                  </button>
                  <button onClick={() => setConfirmDelete(false)}>ביטול</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
