export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-6">תנאי השירות</h1>

      <div className="space-y-6 text-slate-300">
        <section>
          <h2 className="text-2xl font-bold text-white mb-3">
            1. הסכמה לתנאים
          </h2>
          <p>
            בשימוש ב-Postwave, אתה מסכים לתנאים אלו. אם אתה לא
            מסכים, אנא אל תשתמש בשירות.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">
            2. רישיון השימוש
          </h2>
          <p>
            אנו מעניקים לך רישיון מוגבל, אישי ולא-ניתן להעברה להשתמש בשירות.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">
            3. אחריות המשתמש
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>אתה אחראי לסיסמתך ופעילותך</li>
            <li>אתה לא תשתמש בשירות באופן כוחני או הודעה</li>
            <li>אתה לא תעלה תוכן בלתי חוקי</li>
            <li>כל התוכן שלך הוא אחריותך</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">
            4. הגבלת אחריות
          </h2>
          <p>
            השירות מסופק "כמות שהוא". אנו לא אחראים לנזקים עקיפים או
            ישירים.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">
            5. שינויים בתנאים
          </h2>
          <p>
            אנו שומרים לעצמנו את הזכות לשנות תנאים אלו בכל עת. שימוש מתמשך
            פירושו הסכמה.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">
            6. צור קשר
          </h2>
          <p>לשאלות: guyro76@gmail.com</p>
        </section>

        <p className="text-xs text-slate-500 pt-6">
          עדכון אחרון: 2026-06-13
        </p>
      </div>
    </div>
  );
}
