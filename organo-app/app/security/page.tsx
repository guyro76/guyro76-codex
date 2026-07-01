import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { contactEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "אבטחת מידע",
  description: "עקרונות האבטחה של אורגנו, בקרות גישה, הגנות סריקה ודיווח חולשות.",
  alternates: { canonical: "/security" },
};

export default function SecurityPage() {
  return (
    <InfoPage eyebrow="אבטחה כברירת מחדל" title="אבטחת מידע באורגנו" intro="אורגנו מתוכננת לפי עקרונות צמצום מידע, הפרדת לקוחות, הרשאות מינימליות והגנה בשכבות.">
      <section><h2>בקרת גישה</h2><ul><li>כניסה באמצעות Supabase Auth, Google OAuth או דוא״ל וסיסמה.</li><li>גישה בהזמנה בלבד, ללא הרשמה ציבורית פתוחה.</li><li>תפקידי משתמש והרשאות לפי ארגון.</li><li>RLS במסד הנתונים והפרדת מידע בין ארגונים.</li><li>אפשרות להשעיית משתמש וליציאה מהמערכת.</li></ul></section>
      <section><h2>הגנות אפליקטיביות</h2><ul><li>חסימת כתובות מקומיות, רשתות פרטיות ויעדים שמורים.</li><li>אימות DNS, הגבלת הפניות, גודל תגובה וזמן המתנה.</li><li>Rate Limiting ומגבלות גודל בקשה.</li><li>כותרות CSP, HSTS, X-Content-Type-Options ו-Referrer Policy.</li><li>סודות נשמרים במשתני סביבה ואינם נשלחים לקוד לקוח.</li><li>תיעוד פעולות ניהול ואירועים חשובים.</li></ul></section>
      <section><h2>ספקים ותשתיות</h2><p>הגישה לתשתיות מוגבלת למורשים. ספקי משנה נבחנים לפי היקף המידע, אמצעי האבטחה והצורך העסקי.</p></section>
      <section><h2>גיבוי ושחזור</h2><p>המערכת מסתמכת על יכולות הגיבוי של ספקי הענן ועל נהלי המפעיל. לפני הפעלה מסחרית נדרש לבצע בדיקת שחזור מתועדת.</p></section>
      <section><h2>ניהול אירועים</h2><p>אירוע חשוד מתועד ונבדק. לפי הצורך ניתן לחסום חשבון, להחליף סודות, לבודד רכיב ולעדכן גורמים רלוונטיים.</p></section>
      <section><h2>דיווח אחראי</h2><p>אין לנצל חולשה או לגשת למידע של אחרים. ניתן לשלוח תיאור ושלבי שחזור אל <a href={`mailto:${contactEmail}?subject=Organo%20Security%20Report`}>{contactEmail}</a>.</p></section>
      <section><h2>הבהרה</h2><p>אין מערכת חסינה לחלוטין. דף זה מתאר בקרות ותהליכים ואינו מהווה הסמכת אבטחה או התחייבות לזמינות מוחלטת.</p></section>
      <p className="updated">עודכן לאחרונה: 1 ביולי 2026</p>
    </InfoPage>
  );
}
