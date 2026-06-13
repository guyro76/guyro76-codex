export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-6">מדיניות הפרטיות</h1>

      <div className="space-y-6 text-slate-300">
        <section>
          <h2 className="text-2xl font-bold text-white mb-3">
            1. אודות אתר זה
          </h2>
          <p>
            AuthorityBoost AI הוא פלטפורמה לבניית סמכות דיגיטלית ונוכחות
            בתוך רשתות חברתיות. האתר מעובד על ידי גיא רוזנברג.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">
            2. אופן איסוף המידע
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>דואר אלקטרוני וסיסמה (בהרשמה)</li>
            <li>שם משתמש (אופציונלי)</li>
            <li>נתוני העדפות (תחום, קהל יעד, טון)</li>
            <li>מידע על פעילות (פרויקטים, תוכן שנוצר)</li>
            <li>cookie וטכנולוגיות עקיבה</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">
            3. שימוש בנתונים
          </h2>
          <p>המידע משמש ל:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>הנפקת שירות (צמצום תוכן)</li>
            <li>שיפור השירות</li>
            <li>תקשורת עם המשתמש</li>
            <li>ביטחון ומניעת הונאה</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">
            4. הגנה על המידע
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>הצפנה של סיסמאות ב-bcryptjs</li>
            <li>SSL/TLS להצפנת תעבורה</li>
            <li>עדכון מערכות בעקביות</li>
            <li>בדיקות אבטחה קבועות</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">
            5. זכויות המשתמש
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>גישה לנתונים האישיים שלך</li>
            <li>תיקון נתונים שגויים</li>
            <li>מחיקת חשבון והנתונים</li>
            <li>יצוא נתונים</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">
            6. צור קשר
          </h2>
          <p>לשאלות בנוגע לפרטיות: guyro76@gmail.com</p>
        </section>

        <p className="text-xs text-slate-500 pt-6">
          עדכון אחרון: 2026-06-13
        </p>
      </div>
    </div>
  );
}
