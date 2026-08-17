import { useState } from 'react';
import { MAP_H, MAP_W, PLACES, project, type Place } from '../data/places';
import { WORLD_LAND_PATH } from '../data/worldPath';

export interface FoundPlace extends Place {
  name: string;
  times: number;
}

/**
 * המפה האישית: כל מדינה ועיר שנענו נכון נדלקות עליה.
 *
 * הרעיון הוא להפוך ניקוד שנשכח לאוסף שנשאר. ילד שענה "פרו" פעם
 * אחת רואה נקודה בדרום אמריקה, וחודש אחר כך רואה מפה שמתמלאת —
 * וזו סיבה לחזור שאין לטבלת ניקוד.
 *
 * הכול מקומי: קווי היבשות מגיעים כנתיב SVG שנמצא בחבילה, והנקודות
 * מחושבות מטבלת קואורדינטות. אין שירות מפות, אין קריאת רשת, ואין
 * שום קשר למיקום של מי שמשחק.
 */
export default function WorldMap({ found }: { found: FoundPlace[] }) {
  const [picked, setPicked] = useState<FoundPlace | null>(null);

  return (
    <div>
      <svg
        className="world-map"
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        role="img"
        aria-label={`מפת עולם ובה ${found.length} מקומות שגיליתם`}
      >
        <defs>
          <radialGradient id="wm-pin" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="var(--turquoise)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--turquoise)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wm-pin-city" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="var(--gold)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={MAP_W} height={MAP_H} className="wm-ocean" />
        {/* קווי אורך ורוחב עדינים — נותנים תחושת מפה בלי להסיח */}
        <g className="wm-grid">
          {[-60, -30, 0, 30, 60].map((lat) => (
            <line key={lat} x1={0} x2={MAP_W} y1={project(lat, 0).y} y2={project(lat, 0).y} />
          ))}
          {[-120, -60, 0, 60, 120].map((lon) => (
            <line key={lon} y1={0} y2={MAP_H} x1={project(0, lon).x} x2={project(0, lon).x} />
          ))}
        </g>
        <path d={WORLD_LAND_PATH} className="wm-land" />

        {found.map((place) => {
          const { x, y } = project(place.lat, place.lon);
          // מקום שנענה שוב ושוב זוהר יותר, עד גבול שלא משתלט על המפה
          const r = 3.4 + Math.min(place.times, 5) * 0.5;
          return (
            <g key={`${place.kind}-${place.name}`}>
              <circle
                cx={x}
                cy={y}
                r={r * 2.6}
                fill={`url(#${place.kind === 'country' ? 'wm-pin' : 'wm-pin-city'})`}
                opacity={0.55}
              />
              <circle
                cx={x}
                cy={y}
                r={r}
                className={`wm-dot ${place.kind}`}
                tabIndex={0}
                role="button"
                aria-label={`${place.name} — נענה ${place.times} פעמים`}
                onClick={() => setPicked(place)}
                onKeyDown={(ev) => {
                  if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    setPicked(place);
                  }
                }}
              />
            </g>
          );
        })}
      </svg>

      <p className="dim" style={{ fontSize: '0.85rem', margin: '8px 0 0' }} role="status">
        {picked ? (
          <>
            <strong>{picked.name}</strong> · {picked.kind === 'country' ? 'מדינה' : 'עיר'} · נענה{' '}
            {picked.times} פעמים
          </>
        ) : (
          'נוגעים בנקודה כדי לראות מה גיליתם שם'
        )}
      </p>
    </div>
  );
}

/**
 * המרה של תשובות אישיות לנקודות על המפה.
 *
 * מילה שאינה מקום מוכר פשוט לא מופיעה — עדיף לא להראות נקודה מאשר
 * להראות אותה במקום הלא נכון.
 */
export function placesFromAnswers(
  answers: { normalized: string; timesUsed: number; categoryId: string }[]
): FoundPlace[] {
  const byName = new Map<string, FoundPlace>();
  for (const answer of answers) {
    if (answer.categoryId !== 'country' && answer.categoryId !== 'city') continue;
    const place = PLACES.get(answer.normalized);
    if (!place) continue;
    const existing = byName.get(place.name);
    if (existing) existing.times += Math.max(1, answer.timesUsed);
    else byName.set(place.name, { ...place, times: Math.max(1, answer.timesUsed) });
  }
  return [...byName.values()];
}
