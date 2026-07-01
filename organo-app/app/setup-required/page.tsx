import Link from "next/link";

export default function SetupRequiredPage() {
  return (
    <main className="info-shell">
      <article className="info-card glass">
        <p className="info-eyebrow">המערכת מוגנת</p>
        <h1>נדרשת השלמת התקנה</h1>
        <p className="info-intro">מערכת הניתוח הראשית זמינה כעת לשימוש. אזור הניהול והחשבונות יישאר מוגן עד להשלמת חיבור האימות.</p>
        <div className="info-content">
          <section>
            <h2>כניסה למערכת</h2>
            <p><Link href="/">פתח עכשיו את מרכז השליטה של אורגנו</Link></p>
          </section>
          <section><h2>מצב בטוח</h2><p>מסכי ניהול ופעולות רגישות נשארים חסומים כל עוד הגדרות האבטחה אינן מחוברות.</p></section>
          <section><h2>מידע ציבורי</h2><p><Link href="/privacy">מדיניות פרטיות</Link> · <Link href="/accessibility">נגישות</Link> · <Link href="/security">אבטחה</Link> · <Link href="/terms">תנאי שימוש</Link></p></section>
        </div>
      </article>
    </main>
  );
}