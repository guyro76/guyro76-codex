import Link from "next/link";

export default function SetupRequiredPage() {
  return (
    <main className="info-shell">
      <article className="info-card glass">
        <p className="info-eyebrow">המערכת מוגנת</p>
        <h1>נדרשת השלמת התקנה</h1>
        <p className="info-intro">שכבת ההזדהות חסומה עד לחיבור מסד הנתונים ושירות האימות.</p>
        <div className="info-content">
          <section><h2>מצב בטוח</h2><p>כאשר הגדרות האבטחה חסרות, המערכת אינה חושפת מסכים פנימיים או API.</p></section>
          <section><h2>מידע ציבורי</h2><p><Link href="/privacy">מדיניות פרטיות</Link> · <Link href="/accessibility">נגישות</Link> · <Link href="/security">אבטחה</Link> · <Link href="/terms">תנאי שימוש</Link></p></section>
        </div>
      </article>
    </main>
  );
}
