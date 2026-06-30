import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { contactEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "אודות אורגנו",
  description: "מי עומד מאחורי אורגנו, כיצד המערכת מנתחת SEO, GEO ו-AEO ומהן מגבלותיה.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <InfoPage eyebrow="מי אנחנו" title="אודות אורגנו" intro="אורגנו היא מערכת ישראלית לניתוח אתרים, זיהוי חסמי SEO, GEO ו-AEO והפיכת הממצאים להמלצות ותוכן מעשי.">
      <section>
        <h2>מי עומד מאחורי המערכת?</h2>
        <p>אורגנו תוכננה ונבנתה על ידי גיא רוזנברג כחלק ממערכת כלים המסייעת לבעלי אתרים, אנשי תוכן ומשווקים להבין כיצד האתר שלהם מוצג למנועי חיפוש ולמנועי תשובות מבוססי בינה מלאכותית.</p>
      </section>
      <section>
        <h2>מה המערכת בודקת?</h2>
        <ul>
          <li>זמינות האתר, HTTPS, canonical, robots, sitemap ומבנה כותרות.</li>
          <li>Schema, ישויות, מקורות, מבנה סמנטי ונגישות לסורקי AI.</li>
          <li>שאלות ותשובות, קטעים הניתנים לציטוט, רשימות וקישורים פנימיים.</li>
          <li>מדדי ביצועים בסיסיים כגון זמן תגובה, גודל HTML ותמונות.</li>
        </ul>
      </section>
      <section>
        <h2>מה חשוב לדעת?</h2>
        <p>הציון וההמלצות הם כלי עזר מקצועי ולא הבטחה לדירוג בגוגל או להופעה בתשובות של מערכות AI. תוצאות חיפוש מושפעות מגורמים רבים שאינם בשליטת אורגנו.</p>
      </section>
      <section>
        <h2>יצירת קשר</h2>
        <p>לשאלות, תיקונים או הצעות ניתן לפנות בדוא״ל: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.</p>
      </section>
    </InfoPage>
  );
}
