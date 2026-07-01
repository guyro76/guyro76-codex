import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "מדיניות Cookies",
  description: "מידע על cookies ואחסון מקומי באורגנו.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <InfoPage eyebrow="שקיפות טכנולוגית" title="מדיניות Cookies ואחסון מקומי" intro="אורגנו משתמשת באמצעי אחסון חיוניים להפעלת החשבון ושמירת העדפות.">
      <section><h2>Cookies חיוניים</h2><p>Cookies של אימות משמשים לשמירת סשן, כניסה, יציאה והגנה על החשבון. ללא cookies אלה חלק מהמערכת לא יפעל.</p></section>
      <section><h2>אחסון מקומי</h2><p>הדפדפן עשוי לשמור העדפות, מצב אוגי, היסטוריית סריקות בסיסית או טיוטות. ניתן למחוק מידע זה דרך הגדרות הדפדפן.</p></section>
      <section><h2>אנליטיקה</h2><p>כלי אנליטיקה או שיווק שאינם חיוניים יופעלו רק לאחר הוספת הודעה ומנגנון הסכמה מתאימים, כאשר הדבר נדרש.</p></section>
      <section><h2>ספקים חיצוניים</h2><p>כניסה באמצעות Google או שימוש בשירות חיצוני עשויים ליצור cookies בדומיין של אותו ספק.</p></section>
      <section><h2>ניהול</h2><p>ניתן לחסום או למחוק cookies דרך הדפדפן. חסימת cookies חיוניים עלולה למנוע כניסה.</p></section>
      <p className="updated">עודכן לאחרונה: 1 ביולי 2026</p>
    </InfoPage>
  );
}
