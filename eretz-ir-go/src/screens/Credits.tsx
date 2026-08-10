import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { db } from '../db/db';

interface CreditRow {
  key: string;
  name: string;
  pageUrl?: string;
}

export default function Credits() {
  const [imageRows, setImageRows] = useState<CreditRow[]>([]);

  // כל תמונה שהמשחק הציג אי פעם מופיעה כאן עם קישור לעמוד המקור והרישיון:
  // גם תמונות של תשובות שאומתו אונליין וגם תמונות שנמצאו לערכי המאגר.
  useEffect(() => {
    void Promise.all([db.userKnowledge.toArray(), db.imageCache.toArray()]).then(([known, cached]) => {
      const rows: CreditRow[] = [
        ...known
          .filter((r) => r.imageUrl)
          .map((r) => ({ key: `k${r.id}`, name: r.canonicalName, pageUrl: r.source })),
        ...cached
          .filter((r) => r.found && r.url && !r.rejectedByUser)
          .map((r) => ({ key: `c${r.key}`, name: r.title ?? r.normalized, pageUrl: r.pageUrl }))
      ];
      const seen = new Set<string>();
      setImageRows(rows.filter((r) => !seen.has(r.name) && seen.add(r.name)));
    });
  }, []);

  return (
    <div className="screen">
      <TopBar title="📜 מקורות וקרדיטים" />

      <div className="card">
        <h3>מקורות המידע</h3>
        <p>
          מאגר הידע הבסיסי של המשחק נאסף ונבדק ידנית. תשובות חדשות מאומתות מול{' '}
          <strong>ויקיפדיה העברית</strong> (he.wikipedia.org), והמידע המובנה מבוסס על <strong>Wikidata</strong>{' '}
          (רישיון CC0).
        </p>
        <h3>תמונות</h3>
        <p>
          המשחק מציג אך ורק תמונות אמיתיות ממקורות מורשים — בעיקר <strong>Wikimedia Commons</strong> וויקיפדיה. לכל
          תמונה נשמרים המקור והרישיון, והקישור לעמוד המקור מופיע כאן. המשחק לעולם לא מייצר תמונות מלאכותיות של מקומות,
          חיות או אנשים.
        </p>
        <h3>קוד פתוח</h3>
        <p className="dim" style={{ fontSize: '0.9rem' }}>
          React, Vite, Dexie.js, Zustand — תודה לקהילות הקוד הפתוח.
        </p>
      </div>

      {imageRows.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <h3>קרדיטים לתמונות שנטענו</h3>
          {imageRows.map((r) => (
            <div key={r.key} style={{ padding: '6px 0', borderTop: '1px solid var(--border-glass)' }}>
              <strong>{r.name}</strong>{' '}
              {r.pageUrl && (
                <a href={r.pageUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--turquoise)' }}>
                  עמוד המקור והרישיון ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
