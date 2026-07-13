import TopBar from '../components/TopBar';

/**
 * משחק בשני מכשירים דורש שרת (Supabase Realtime).
 * שכבת ה-Multiplayer Provider קיימת בקוד (ראו src/multiplayer/) —
 * מסך זה מסביר להורים איך להפעיל אותה, בשקיפות מלאה ובלי כפתורים מתים.
 */
export default function MultiplayerInfo() {
  return (
    <div className="screen">
      <TopBar title="📡 משחק בשני מכשירים" back="mode-select" />

      <div className="card">
        <h3>מה עובד כבר עכשיו?</h3>
        <p>
          דו-קרב ושיתוף פעולה עובדים במלואם <strong>על אותו מכשיר</strong> — טאבלט או מחשב — כולל הסתרת תשובות ומעבר
          תורות. זה לא דורש אינטרנט בכלל.
        </p>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h3>משחק מרחוק (כל אחד ממכשיר שלו)</h3>
        <p>
          למשחק בין שני מכשירים נדרש שרת קטן שמסנכרן את החדר. הקוד כולל שכבת <code>MultiplayerProvider</code> מוכנה
          לחיבור ל-Supabase Realtime (חינמי לשימוש ביתי):
        </p>
        <ol style={{ lineHeight: 1.8 }}>
          <li>הורה פותח פרויקט חינמי ב-supabase.com</li>
          <li>מריצים את הסכמה מהקובץ <code>supabase/schema.sql</code> שבפרויקט</li>
          <li>מגדירים את הכתובת והמפתח הציבורי בקובץ <code>.env</code> (ראו <code>env.example</code>)</li>
          <li>בונים מחדש — ומצב "יצירת חדר" עם קוד QR יופיע כאן אוטומטית</li>
        </ol>
        <p className="dim" style={{ fontSize: '0.88rem' }}>
          עד אז המצב מוסתר בכוונה — במקום כפתור שלא עובד. כל שאר המשחק עובד תמיד, גם בלי שרת ובלי אינטרנט.
        </p>
      </div>
    </div>
  );
}
