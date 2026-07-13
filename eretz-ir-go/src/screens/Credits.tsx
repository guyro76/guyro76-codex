import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { db, type UserKnowledgeRow } from '../db/db';

export default function Credits() {
  const [imageRows, setImageRows] = useState<UserKnowledgeRow[]>([]);

  useEffect(() => {
    void db.userKnowledge.toArray().then((rows) => setImageRows(rows.filter((r) => r.imageUrl)));
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
            <div key={r.id} style={{ padding: '6px 0', borderTop: '1px solid var(--border-glass)' }}>
              <strong>{r.canonicalName}</strong>{' '}
              <a href={r.source} target="_blank" rel="noreferrer" style={{ color: 'var(--turquoise)' }}>
                עמוד המקור והרישיון ↗
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
