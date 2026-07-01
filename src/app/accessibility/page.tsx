export default function AccessibilityPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-6">הצהרת נגישות</h1>
      <div className="space-y-6 text-slate-300 leading-8">
        <section>
          <h2 className="text-2xl font-bold text-white mb-3">מחויבות לנגישות</h2>
          <p>
            אורגנו נבנה מתוך מטרה לאפשר שימוש נוח וברור ככל האפשר לכל המשתמשים,
            כולל אנשים עם מוגבלויות. האתר עושה שימוש במבנה סמנטי, ניגודיות גבוהה,
            ניווט מקלדת ותוכן קריא בעברית.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-white mb-3">התאמות שבוצעו</h2>
          <ul className="list-disc pr-6 space-y-2">
            <li>כותרות היררכיות וברורות.</li>
            <li>טקסטים בעלי ניגודיות גבוהה על רקע כהה.</li>
            <li>תמיכה בכיוון כתיבה עברי מימין לשמאל.</li>
            <li>שדות וכפתורים עם תוויות מובנות.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-white mb-3">דיווח על בעיית נגישות</h2>
          <p>
            אם נתקלת בקושי להשתמש באתר, ניתן לפנות לבעל האתר עם תיאור הבעיה,
            הדפדפן והמכשיר שבו השתמשת, ונפעל לתיקון במהירות האפשרית.
          </p>
        </section>
      </div>
    </div>
  );
}
