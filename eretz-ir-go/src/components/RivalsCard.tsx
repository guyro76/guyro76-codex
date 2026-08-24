import { useEffect, useState } from 'react';
import { useApp } from '../store/appStore';
import { loadRivals, rivalLabel, totalGames, type RivalRow } from '../lib/rivals';

/**
 * "מי מוביל מול מי" — הכרטיס שמחזיר ילדים למשחק.
 *
 * יריבות היא מה שמחזיר ילד בן עשר, לא ניקוד מצטבר. הכרטיס מוצג רק
 * כשיש בו תוכן: כרטיס ריק שאומר "עדיין לא שיחקת מול אף אחד" הוא
 * רעש קבוע במסך הבית.
 *
 * הניסוח נאמן למה שנספר בפועל — ראו את ההסבר ב-`lib/rivals.ts`.
 * המספרים הם של הסיבובים ש**אתה** שיחקת מול האתגרים שלהם, ולכן
 * הכרטיס אומר "מהאתגרים ששיחקת" ולא מתיימר להיות טבלה משותפת.
 */
export default function RivalsCard() {
  const activeProfile = useApp((s) => s.activeProfile);
  const [rows, setRows] = useState<RivalRow[]>([]);

  useEffect(() => {
    if (!activeProfile?.id) return;
    let live = true;
    void loadRivals(activeProfile.id).then((all) => {
      if (live) setRows(all.filter((r) => totalGames(r) > 0));
    });
    return () => {
      live = false;
    };
  }, [activeProfile?.id]);

  if (!rows.length) return null;

  return (
    <div className="card rivals-card">
      <h3 style={{ margin: '0 0 2px' }}>⚔️ מול מי שיחקת</h3>
      <p className="dim" style={{ margin: '0 0 8px', fontSize: '0.8rem' }}>
        מהאתגרים שהם שלחו לך
      </p>

      <ul className="rivals-list">
        {rows.slice(0, 5).map((r) => (
          <li key={`${r.name}-${r.id}`}>
            <span className="rival-name">{r.name}</span>
            <span className="rival-score">
              <strong className={r.wins > r.losses ? 'gold' : undefined}>{r.wins}</strong>
              <span aria-hidden> : </span>
              <strong>{r.losses}</strong>
            </span>
            <span className="rival-label">{rivalLabel(r)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
