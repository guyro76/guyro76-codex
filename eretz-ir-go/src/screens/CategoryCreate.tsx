import { useState } from 'react';
import { useApp } from '../store/appStore';
import TopBar from '../components/TopBar';
import { db } from '../db/db';
import { normalizeHebrew } from '../lib/hebrew';

const ICONS = ['🌟', '🎁', '🧸', '🍭', '🪐', '🧪', '🎪', '🐾', '🏰', '🛸'];
const COLORS = ['#7c5cff', '#33d6c3', '#ff5c8a', '#ffd75c', '#5cff8f'];

export default function CategoryCreate() {
  const { navigate, activeProfile, loadCustomCategories } = useApp();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [description, setDescription] = useState('');
  const [examples, setExamples] = useState('');
  const [starterWords, setStarterWords] = useState('');
  const [allowProperNames, setAllowProperNames] = useState(false);
  const [allowMultiWord, setAllowMultiWord] = useState(true);

  const save = async () => {
    if (!name.trim() || !activeProfile?.id) return;
    const id = `custom-${Date.now()}`;
    await db.customCategories.add({
      profileId: activeProfile.id,
      category: {
        id,
        name: name.trim(),
        icon,
        color,
        description: description.trim() || name.trim(),
        examples: examples.split(',').map((x) => x.trim()).filter(Boolean),
        allowProperNames,
        allowMultiWord,
        allowLatin: false,
        custom: true
      },
      starterWords: starterWords.split(',').map((x) => x.trim()).filter(Boolean),
      createdAt: new Date().toISOString()
    });
    // מילות הפתיחה נכנסות למילון האישי — כך הן מאושרות ומופיעות בהשלמה
    for (const word of starterWords.split(',').map((x) => x.trim()).filter(Boolean)) {
      const normalized = normalizeHebrew(word);
      await db.personalAnswers.add({
        profileId: activeProfile.id,
        categoryId: id,
        letter: normalized.charAt(0),
        text: word,
        normalized,
        timesUsed: 0,
        discoveredAt: new Date().toISOString(),
        viaHint: false,
        favorite: false
      });
    }
    await loadCustomCategories();
    navigate('categories');
  };

  return (
    <div className="screen">
      <TopBar title="קטגוריה אישית חדשה" back="categories" />
      <div className="card grid" style={{ gap: 14 }}>
        <label>
          שם הקטגוריה
          <input type="text" value={name} onChange={(ev) => setName(ev.target.value)} placeholder='למשל: "גיבורי על"' maxLength={30} />
        </label>

        <div>
          <p style={{ margin: '0 0 6px' }}>אייקון</p>
          <div className="row">
            {ICONS.map((i) => (
              <button key={i} className={`chip${i === icon ? ' on' : ''}`} style={{ fontSize: '1.3rem' }} onClick={() => setIcon(i)}>
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p style={{ margin: '0 0 6px' }}>צבע</p>
          <div className="row">
            {COLORS.map((c) => (
              <button
                key={c}
                aria-label={`צבע ${c}`}
                style={{ width: 40, height: 40, minHeight: 40, borderRadius: '50%', padding: 0, background: c, border: c === color ? '3px solid white' : 'none' }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <label>
          תיאור קצר
          <input type="text" value={description} onChange={(ev) => setDescription(ev.target.value)} placeholder="מה נחשב תשובה נכונה?" />
        </label>

        <label>
          דוגמאות (מופרדות בפסיק)
          <input type="text" value={examples} onChange={(ev) => setExamples(ev.target.value)} placeholder="סופרמן, וונדר וומן" />
        </label>

        <label>
          רשימת מילים התחלתית (מופרדות בפסיק) — ייכנסו להשלמה האוטומטית
          <textarea rows={3} value={starterWords} onChange={(ev) => setStarterWords(ev.target.value)} placeholder="ספיידרמן, באטמן, אקוומן" />
        </label>

        <label className="row">
          <input type="checkbox" style={{ width: 24, minHeight: 24 }} checked={allowProperNames} onChange={(ev) => setAllowProperNames(ev.target.checked)} />
          מותר שמות פרטיים
        </label>
        <label className="row">
          <input type="checkbox" style={{ width: 24, minHeight: 24 }} checked={allowMultiWord} onChange={(ev) => setAllowMultiWord(ev.target.checked)} />
          מותרת תשובה של כמה מילים
        </label>

        <p className="dim" style={{ fontSize: '0.9rem' }}>
          בקטגוריה אישית, תשובות שאינן ברשימה יסומנו "בבדיקה" ויאושרו אונליין או במצב הורה.
        </p>

        <button className="btn-primary" disabled={!name.trim()} onClick={() => void save()}>
          יצירת הקטגוריה ⭐
        </button>
      </div>
    </div>
  );
}
