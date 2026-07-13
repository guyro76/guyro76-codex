import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { useApp } from '../store/appStore';
import { useGame } from '../store/gameStore';
import { dailyChallenge, todayKey } from '../lib/daily';
import { CATEGORIES } from '../data/categories';
import { db } from '../db/db';
import type { DailyResult } from '../types';

export default function Daily() {
  const { navigate, activeProfile } = useApp();
  const startMatch = useGame((s) => s.startMatch);
  const rollLetter = useGame((s) => s.rollLetter);
  const [history, setHistory] = useState<DailyResult[]>([]);

  const spec = dailyChallenge(todayKey());
  const cats = spec.categoryIds.map((id) => CATEGORIES.find((c) => c.id === id)).filter((c) => c != null);
  const todayDone = history.some((h) => h.date === spec.date);

  useEffect(() => {
    if (!activeProfile?.id) return;
    void db.dailyResults.where('profileId').equals(activeProfile.id).reverse().sortBy('date').then(setHistory);
  }, [activeProfile]);

  const start = () => {
    if (!activeProfile) return;
    startMatch(
      {
        mode: 'daily',
        categoryIds: spec.categoryIds,
        roundSeconds: spec.seconds,
        rounds: 1,
        difficulty: activeProfile.difficulty,
        hintsPerRound: 2,
        powerCards: false
      },
      cats,
      [activeProfile],
      spec.date
    );
    rollLetter(spec.letter); // האות היומית קבועה לכולם
    navigate('letter-draw');
  };

  return (
    <div className="screen">
      <TopBar title="📅 האתגר היומי" />

      <div className="card center" style={{ borderColor: 'var(--gold)' }}>
        <p className="dim" style={{ margin: 0 }}>
          {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 style={{ fontSize: '3.4rem', margin: '6px 0' }}>{spec.letter}</h1>
        <p>האות היומית — זהה לכל השחקנים בכל העולם 🌍</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          {cats.map((c) => (
            <span key={c.id} className="chip">
              {c.icon} {c.name}
            </span>
          ))}
        </div>
        <p className="dim">
          ⏱️ {spec.seconds / 60} דקות{spec.originalityBonusX2 ? ' · ✨ היום בונוס מקוריות כפול!' : ''}
        </p>
        <p>🔥 הרצף של {activeProfile?.name}: {activeProfile?.dailyStreak ?? 0} ימים</p>
        {todayDone ? (
          <p className="status-text-ok">✅ סיימת את האתגר של היום! חוזרים מחר לרצף.</p>
        ) : (
          <button className="btn-gold" style={{ fontSize: '1.15rem' }} onClick={start}>
            יאללה, לאתגר! 🏁
          </button>
        )}
      </div>

      {history.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <strong>התוצאות הקודמות שלי</strong>
          {history.slice(0, 10).map((h) => (
            <div key={h.id} className="row spread" style={{ padding: '6px 0', borderTop: '1px solid var(--border-glass)' }}>
              <span>
                {h.date} · האות {h.letter}
              </span>
              <span className="gold">{h.score} נק׳ {h.date === spec.date ? '🏅' : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
