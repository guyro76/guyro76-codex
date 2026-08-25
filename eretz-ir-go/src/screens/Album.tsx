import { useEffect, useMemo, useState } from 'react';
import TopBar from '../components/TopBar';
import { useApp } from '../store/appStore';
import { db } from '../db/db';
import type { PersonalAnswer } from '../types';
import { CATEGORIES } from '../data/categories';
import { getKnowledgeBase } from '../lib/knowledge';
import AnswerImage from '../components/AnswerImage';
import WorldMap, { placesFromAnswers } from '../components/WorldMap';
import { PLACE_COUNTS } from '../data/places';

type Filter = 'all' | 'fav' | 'hint' | 'rare';

export default function Album() {
  const { activeProfile, customCategories } = useApp();
  const [words, setWords] = useState<PersonalAnswer[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [catFilter, setCatFilter] = useState<string>('');
  const kb = getKnowledgeBase();
  const allCats = [...CATEGORIES, ...customCategories];

  useEffect(() => {
    if (!activeProfile?.id) return;
    void db.personalAnswers.where('profileId').equals(activeProfile.id).toArray().then(setWords);
  }, [activeProfile]);

  const filtered = useMemo(() => {
    return words
      .filter((w) => (catFilter ? w.categoryId === catFilter : true))
      .filter((w) => {
        if (filter === 'fav') return w.favorite;
        if (filter === 'hint') return w.viaHint;
        if (filter === 'rare') {
          const item = kb.findExact(w.normalized)[0];
          return (item?.rarityScore ?? 50) >= 60;
        }
        return true;
      })
      .sort((a, b) => b.discoveredAt.localeCompare(a.discoveredAt));
  }, [words, filter, catFilter, kb]);

  /**
   * המפה נבנית מכל האוסף ולא מהמסונן: פילטר של "מועדפות" לא אמור
   * למחוק מקומות מהמפה — היא רשומה של איפה היית, לא תצוגה של מה
   * שמסומן כרגע.
   */
  const foundPlaces = useMemo(() => placesFromAnswers(words), [words]);

  const toggleFav = async (w: PersonalAnswer) => {
    if (!w.id) return;
    await db.personalAnswers.update(w.id, { favorite: !w.favorite });
    setWords((prev) => prev.map((x) => (x.id === w.id ? { ...x, favorite: !w.favorite } : x)));
  };

  return (
    <div className="screen">
      <TopBar title="🃏 אוסף המילים שלי" />
      <p className="dim">
        {words.length} מילים באוסף של {activeProfile?.name}
      </p>

      {foundPlaces.length > 0 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="row spread" style={{ marginBottom: 8 }}>
            <strong>🗺️ המפה שלי</strong>
            <span className="dim" style={{ fontSize: '0.85rem' }}>
              {foundPlaces.length} מתוך {PLACE_COUNTS.countries + PLACE_COUNTS.cities}
            </span>
          </div>
          <WorldMap found={foundPlaces} />
        </div>
      )}

      <div className="row" style={{ marginBottom: 10 }}>
        {(
          [
            ['all', 'הכול'],
            ['fav', '⭐ מועדפות'],
            ['rare', '💎 נדירות'],
            ['hint', '💡 בעזרת רמז']
          ] as [Filter, string][]
        ).map(([f, label]) => (
          <button key={f} className={`chip${filter === f ? ' on' : ''}`} onClick={() => setFilter(f)}>
            {label}
          </button>
        ))}
        {/*
          התווית היא aria-label ולא <label> נראה, כי הבורר יושב בשורת
          הסינון לצד צ'יפים ואין לו מקום לכיתוב. בלעדיה קורא מסך מכריז
          "תיבה נפתחת" בלי לומר מה היא מסננת — וזו הפרה של WCAG 4.1.2
          שנתפסה ב-e2e/a11y.spec.ts.
        */}
        <select
          value={catFilter}
          onChange={(ev) => setCatFilter(ev.target.value)}
          aria-label="סינון לפי קטגוריה"
          style={{ maxWidth: 180 }}
        >
          <option value="">כל הקטגוריות</option>
          {allCats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-2">
        {filtered.map((w) => {
          const cat = allCats.find((c) => c.id === w.categoryId);
          const item = kb.findExact(w.normalized).find((x) => x.categoryIds.includes(w.categoryId)) ?? kb.findExact(w.normalized)[0];
          return (
            <div key={w.id} className="word-card">
              <div className="row spread">
                <strong style={{ fontSize: '1.15rem' }}>{w.text}</strong>
                <button
                  className="btn-small btn-ghost"
                  aria-label={w.favorite ? 'הסרה ממועדפים' : 'הוספה למועדפים'}
                  onClick={() => void toggleFav(w)}
                >
                  {w.favorite ? '⭐' : '☆'}
                </button>
              </div>
              <p className="dim" style={{ margin: '2px 0', fontSize: '0.85rem' }}>
                {cat?.icon} {cat?.name} · האות {w.letter}
              </p>
              <AnswerImage item={item} label={w.text} categoryId={w.categoryId} />
              {item?.facts?.[0] && <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>💡 {item.facts[0]}</p>}
              <p className="dim" style={{ margin: 0, fontSize: '0.78rem' }}>
                {new Date(w.discoveredAt).toLocaleDateString('he-IL')} · שימושים: {w.timesUsed}
                {w.viaHint ? ' · בעזרת ארצי 🤖' : ''}
                {(item?.rarityScore ?? 0) >= 60 ? ' · 💎 נדירה' : ''}
              </p>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <p className="center dim">עדיין אין כאן מילים — כל תשובה נכונה במשחק מצטרפת לאוסף! 🎮</p>}
    </div>
  );
}
