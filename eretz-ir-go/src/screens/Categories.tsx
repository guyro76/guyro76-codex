import { useEffect, useMemo, useState } from 'react';
import { ARTZI_PROFILE } from '../data/botProfile';
import { useApp } from '../store/appStore';
import { useGame } from '../store/gameStore';
import TopBar from '../components/TopBar';
import { CATEGORIES, CLASSIC_CATEGORY_IDS } from '../data/categories';
import { getSetting, setSetting } from '../db/db';
import { loadModeDraft } from './ModeSelect';
import { getKnowledgeBase } from '../lib/knowledge';
import { buildLetterIndex, categoriesToFixThin, isThinSelection } from '../lib/letters';

const PRESETS = [
  { name: 'מהיר', count: 5 },
  { name: 'רגיל', count: 7 },
  { name: 'קלאסי', count: 9 },
  { name: 'מורחב', count: 12 }
];

export default function Categories() {
  const { navigate, activeProfile, secondProfile, customCategories } = useApp();
  const startMatch = useGame((s) => s.startMatch);
  const [selected, setSelected] = useState<string[]>(CLASSIC_CATEGORY_IDS);

  const all = [...CATEGORIES, ...customCategories];

  useEffect(() => {
    void getSetting('favoriteCategorySet').then((v) => {
      if (v) setSelected(JSON.parse(v) as string[]);
    });
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 12) return prev; // מקסימום 12
      return [...prev, id];
    });
  };

  const move = (id: string, dir: -1 | 1) => {
    setSelected((prev) => {
      const idx = prev.indexOf(id);
      const to = idx + dir;
      if (idx < 0 || to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });
  };

  const applyPreset = (count: number) => {
    const classicFirst = [...CLASSIC_CATEGORY_IDS, ...CATEGORIES.filter((c) => !c.classic).map((c) => c.id)];
    setSelected(classicFirst.slice(0, count));
  };

  const start = async () => {
    if (!activeProfile) return;
    const draft = await loadModeDraft();
    // שמירה ברקע: המעבר למשחק לא ממתין לדיסק
    void setSetting('favoriteCategorySet', JSON.stringify(selected));
    const cats = selected.map((id) => all.find((c) => c.id === id)).filter((c) => c != null);
    // נגד ארצי: היריב אינו פרופיל שנבחר אלא שחקן שהמשחק מוסיף
    const players =
      draft.mode === 'bot'
        ? [activeProfile, ARTZI_PROFILE]
        : draft.mode === 'duel' || draft.mode === 'coop' || draft.mode === 'tournament'
          ? [activeProfile, secondProfile].filter((p) => p != null)
          : [activeProfile];
    startMatch(
      {
        mode: draft.mode,
        categoryIds: selected,
        roundSeconds: draft.mode === 'practice' ? 0 : draft.seconds,
        rounds: draft.rounds,
        difficulty: activeProfile.difficulty,
        hintsPerRound: draft.mode === 'practice' ? 99 : 3,
        powerCards: draft.powerCards,
        choiceMode: draft.choiceMode
      },
      cats,
      players
    );
    navigate('letter-draw');
  };

  const valid = selected.length >= 5 && selected.length <= 12;

  /**
   * אזהרה **לפני** ההגרלה, ולא אחריה.
   *
   * ילד שבוחר בעצמו רק קטגוריות כמו שיר, להקה, ספר ומשחק מחשב —
   * כולן שמות פרטיים שהמאגר דל בהם — מקבל צירוף שבו כמעט אין אות
   * כשירה. ההגרלה תבחר בכל זאת את הטובה שאפשר, אבל הילד לא יודע
   * למה כל הקלפים ריקים. עדיף לומר את זה כאן, כשעוד אפשר לשנות.
   *
   * החישוב משתמש ב-`isThinSelection`, כלומר **באותו כלל בדיוק**
   * כמו ההגרלה עצמה.
   */
  const letterIndex = useMemo(() => buildLetterIndex(getKnowledgeBase().items), []);
  const difficulty = activeProfile?.difficulty ?? 'medium';
  const thin = useMemo(
    () => valid && isThinSelection(selected, difficulty, letterIndex),
    [valid, selected, difficulty, letterIndex]
  );
  // בדיוק כמה קלאסיות צריך כדי שהאזהרה תיעלם — או null אם אין כמות שנכנסת
  const fix = useMemo(
    () => (thin ? categoriesToFixThin(selected, CLASSIC_CATEGORY_IDS, difficulty, letterIndex) : null),
    [thin, selected, difficulty, letterIndex]
  );

  return (
    <div className="screen">
      <TopBar title="בחירת קטגוריות" back="mode-select" />

      <div className="row" style={{ marginBottom: 10 }}>
        {PRESETS.map((p) => (
          <button key={p.count} className={`chip${selected.length === p.count ? ' on' : ''}`} onClick={() => applyPreset(p.count)}>
            {p.name} ({p.count})
          </button>
        ))}
        <button className="chip" onClick={() => navigate('category-create')}>
          ➕ קטגוריה אישית
        </button>
      </div>

      {/* מקף עברי (–) בין שני מספרים הוא תו ניטרלי, ולכן הטווח
          הוצג הפוך — "12–5". מקף רגיל נבלע לתוך המספר ונשאר "5-12". */}
      <p className={valid ? 'dim' : 'status-text-bad'}>
        נבחרו {selected.length} מתוך 5-12 {selected.length >= 12 ? '(הגעתם למקסימום)' : ''}
      </p>

      {selected.length > 0 && (
        <div className="card" style={{ marginBottom: 12 }}>
          <strong>הסדר במשחק</strong> <span className="dim">(אפשר להזיז עם החצים)</span>
          <div style={{ marginTop: 8 }}>
            {selected.map((id, i) => {
              const cat = all.find((c) => c.id === id);
              if (!cat) return null;
              return (
                <div key={id} className="row spread" style={{ padding: '4px 0' }}>
                  <span>
                    {i + 1}. {cat.icon} {cat.name}
                  </span>
                  <span>
                    <button className="btn-small btn-ghost" aria-label="הזזה למעלה" onClick={() => move(id, -1)} disabled={i === 0}>
                      ↑
                    </button>
                    <button
                      className="btn-small btn-ghost"
                      aria-label="הזזה למטה"
                      onClick={() => move(id, 1)}
                      disabled={i === selected.length - 1}
                    >
                      ↓
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="row">
        {all.map((cat) => (
          <button
            key={cat.id}
            className={`chip${selected.includes(cat.id) ? ' on' : ''}`}
            aria-pressed={selected.includes(cat.id)}
            title={cat.description}
            onClick={() => toggle(cat.id)}
          >
            {cat.icon} {cat.name}
            {cat.custom ? ' ⭐' : ''}
          </button>
        ))}
      </div>

      {thin && (
        <div className="card thin-warning" role="status" style={{ marginBottom: 12 }}>
          <strong>🤔 שימו לב: בצירוף הזה יש מעט מילים</strong>
          <p style={{ margin: '6px 0 10px' }}>
            ארצי מכיר מילים רק בחלק מהאותיות של הקטגוריות שבחרתם, ולכן ייתכן
            שתקבלו אות שקשה מאוד למצוא בה תשובות.
            {fix ? '' : ' כדאי להחליף כמה מהן בקטגוריות קלאסיות כמו ארץ, עיר וחי.'}
          </p>
          {fix && (
            <button className="btn-small" onClick={() => setSelected([...selected, ...fix])}>
              ➕ להוסיף {fix.length} קטגוריות קלאסיות
            </button>
          )}
        </div>
      )}

      <div className="action-bar">
      <button className="btn-primary" style={{ width: '100%' }} disabled={!valid} onClick={() => void start()}>
        להגרלת האות! 🎡
      </button>
      </div>
    </div>
  );
}
