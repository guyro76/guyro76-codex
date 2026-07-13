import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { useApp } from '../store/appStore';
import { ACHIEVEMENTS } from '../data/achievements';
import { db } from '../db/db';

export default function Achievements() {
  const { activeProfile } = useApp();
  const [collectionSize, setCollectionSize] = useState(0);

  useEffect(() => {
    if (!activeProfile?.id) return;
    void db.personalAnswers.where('profileId').equals(activeProfile.id).count().then(setCollectionSize);
  }, [activeProfile]);

  if (!activeProfile) return null;
  const earned = ACHIEVEMENTS.filter((a) => a.check(activeProfile, { collectionSize }));

  return (
    <div className="screen">
      <TopBar title="🎖️ ההישגים שלי" />
      <p className="dim">
        {activeProfile.name} — {earned.length} מתוך {ACHIEVEMENTS.length} הישגים
      </p>
      <div className="grid grid-2">
        {ACHIEVEMENTS.map((a) => {
          const has = earned.includes(a);
          return (
            <div key={a.id} className="card center" style={{ opacity: has ? 1 : 0.45 }}>
              <div style={{ fontSize: '2.4rem', filter: has ? 'none' : 'grayscale(1)' }} aria-hidden>
                {a.icon}
              </div>
              <strong>{a.name}</strong>
              <p className="dim" style={{ fontSize: '0.85rem', margin: '4px 0 0' }}>
                {a.description}
              </p>
              {has && <p style={{ color: 'var(--ok)', margin: '4px 0 0' }}>הושג! ✔</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
