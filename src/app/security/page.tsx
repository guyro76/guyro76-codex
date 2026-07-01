export default function SecurityPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-6">אבטחת מידע</h1>
      <div className="space-y-6 text-slate-300 leading-8">
        <section>
          <h2 className="text-2xl font-bold text-white mb-3">עקרונות אבטחה</h2>
          <p>
            אורגנו מתוכנן לשמור על מידע עסקי ונתוני סריקות בצורה אחראית, עם הפרדה
            בין מידע ציבורי למידע פרטי, שימוש בהרשאות וגישה מבוקרת למסכי ניהול.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-white mb-3">מידע רגיש</h2>
          <p>
            אין לשמור באתר סודות מערכת, מפתחות שירות או פרטי התחברות בתוך קוד צד לקוח.
            מפתחות שרת צריכים להיות מוגדרים רק במשתני סביבה מאובטחים של סביבת השרת.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-white mb-3">דיווח על חולשה</h2>
          <p>
            במקרה של חשד לחולשת אבטחה, יש לדווח לבעל האתר עם פירוט מינימלי שמאפשר
            בדיקה, ללא ניצול החולשה או חשיפת מידע של משתמשים אחרים.
          </p>
        </section>
      </div>
    </div>
  );
}
