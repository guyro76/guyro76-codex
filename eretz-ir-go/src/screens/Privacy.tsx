import { useState } from 'react';
import TopBar from '../components/TopBar';
import { db } from '../db/db';
import { useApp } from '../store/appStore';

export default function Privacy() {
  const { navigate, loadProfiles } = useApp();
  const [confirm, setConfirm] = useState(false);

  const wipeAll = async () => {
    await db.delete();
    await db.open();
    await loadProfiles();
    navigate('splash');
  };

  return (
    <div className="screen">
      <TopBar title="🔐 פרטיות ומחיקת מידע" />

      <div className="card">
        <h3>מה נשמר — ואיפה?</h3>
        <ul style={{ lineHeight: 1.8 }}>
          <li>✅ פרופילים, תוצאות ואוסף המילים נשמרים <strong>רק במכשיר הזה</strong> (IndexedDB).</li>
          <li>✅ אין חשבון, אין אימייל, אין מספר טלפון.</li>
          <li>✅ אין פרסומות ואין מעקב.</li>
          <li>✅ הרמזים של ארצי מחושבים במכשיר — שום תשובה לא נשלחת לשירות AI.</li>
          <li>
            🌐 הדבר היחיד שנשלח לרשת: כשכותבים תשובה שאינה במאגר, המשחק מחפש אותה בוויקיפדיה העברית (כמו חיפוש רגיל
            בדפדפן) כדי לוודא שהיא אמיתית. לא נשלח שום פרט אישי.
          </li>
        </ul>
      </div>

      <div className="card" style={{ marginTop: 14, borderColor: 'var(--bad)' }}>
        <h3>🗑️ מחיקת כל המידע</h3>
        <p className="dim">מוחק את כל הפרופילים, המילים, התוצאות וההגדרות מהמכשיר. בלתי הפיך.</p>
        {!confirm ? (
          <button onClick={() => setConfirm(true)}>מחיקת הכול...</button>
        ) : (
          <div className="row">
            <button className="btn-coral" onClick={() => void wipeAll()}>
              כן, למחוק את הכול לצמיתות
            </button>
            <button onClick={() => setConfirm(false)}>ביטול</button>
          </div>
        )}
      </div>
    </div>
  );
}
