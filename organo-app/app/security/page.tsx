import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { contactEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "אבטחת מידע",
  description: "עקרונות האבטחה של אורגנו, הגנות הסריקה ודרך אחראית לדווח על חולשה.",
  alternates: { canonical: "/security" },
};

export default function SecurityPage() {
  return (
    <InfoPage eyebrow="אבטחה כברירת מחדל" title="אבטחת מידע באורגנו" intro="אורגנו מתוכננת לנתח מידע ציבורי בלבד ולהפחית סיכונים למשתמש, לאתר הנבדק ולתשתית המערכת.">
      <section>
        <h2>הגנות מרכזיות</h2>
        <ul>
          <li>חסימת localhost, רשתות פרטיות, כתובות שמורות ויעדי metadata.</li>
          <li>אימות DNS מחדש לפני קריאות והפניות כדי לצמצם סיכוני SSRF.</li>
          <li>הגבלת מספר הפניות, גודל תגובה וזמן המתנה לכל סריקה.</li>
          <li>Rate Limiting לניתוח, יצירת תוכן והיסטוריה.</li>
          <li>המערכת אינה מבקשת סיסמאות ואינה מתחברת לאזורי ניהול של האתר הנבדק.</li>
        </ul>
      </section>
      <section>
        <h2>סריקת אתרים חוסמי Bot</h2>
        <p>כאשר אתר ציבורי חוסם קריאה ישירה, אורגנו עשויה להשתמש בדפדפן מרונדר דרך ספק Reader. במקרה כזה התוצאה מסומנת כבדיקה מוגבלת, כדי שלא להציג מידע חלקי כבדיקה טכנית מלאה.</p>
      </section>
      <section>
        <h2>דיווח אחראי על חולשה</h2>
        <p>מצאת חולשת אבטחה? אין לנצל אותה, לגשת למידע של אחרים או לבצע בדיקות עומס. שלח תיאור, שלבי שחזור והשפעה משוערת אל <a href={`mailto:${contactEmail}?subject=Organo%20Security%20Report`}>{contactEmail}</a>.</p>
      </section>
      <section>
        <h2>היקף</h2>
        <p>דף זה מתאר את עקרונות ההגנה של אורגנו ואינו מהווה הסמכת אבטחה, בדיקת חדירות או התחייבות לכך שמערכת תוכנה חסינה לחלוטין.</p>
      </section>
      <p className="updated">עודכן לאחרונה: 30 ביוני 2026</p>
    </InfoPage>
  );
}
