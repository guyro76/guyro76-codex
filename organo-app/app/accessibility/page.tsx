import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { contactEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "הצהרת נגישות",
  description: "הצהרת הנגישות של אורגנו, אמצעי הנגישות במערכת ודרך לדווח על קושי.",
  alternates: { canonical: "/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <InfoPage eyebrow="נגישות דיגיטלית" title="הצהרת נגישות" intro="אנו פועלים כדי שאורגנו תהיה שימושית, ברורה ונגישה ככל האפשר לאנשים עם מגוון יכולות וטכנולוגיות מסייעות.">
      <section>
        <h2>עקרונות הנגישות שיושמו</h2>
        <ul>
          <li>מבנה RTL מלא בעברית וכותרות היררכיות.</li>
          <li>שימוש באמצעות מקלדת, מצבי focus ברורים ותוויות לשדות.</li>
          <li>ניגודיות גבוהה בין טקסט, רקע וכפתורי פעולה.</li>
          <li>הודעות שגיאה נגישות באמצעות role=&quot;alert&quot;.</li>
          <li>התאמה למסכים קטנים והגדלת טקסט ללא אובדן תוכן מרכזי.</li>
        </ul>
      </section>
      <section>
        <h2>יעד התאימות</h2>
        <p>המערכת מפותחת מתוך שאיפה לעמוד בעקרונות WCAG 2.1 ברמה AA ובהוראות הנגישות הרלוונטיות לשירותי אינטרנט בישראל. ייתכנו רכיבים או תכנים חיצוניים שאינם בשליטה מלאה של אורגנו.</p>
      </section>
      <section>
        <h2>מגבלות ידועות</h2>
        <p>תוצאות ניתוח עשויות לכלול כתובות, קוד Schema וטקסט מאתרים חיצוניים. הנגישות של התוכן המקורי תלויה באתר שנבדק. אנו ממשיכים לבדוק את הממשק ולתקן בעיות שמתגלות.</p>
      </section>
      <section>
        <h2>דיווח על קושי</h2>
        <p>נתקלת בבעיה? שלח תיאור של הפעולה, הדפדפן, המכשיר וטכנולוגיית העזר שבה השתמשת אל <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. נעשה מאמץ לבדוק את הפנייה ולטפל בה בהקדם האפשרי.</p>
      </section>
      <p className="updated">עודכן לאחרונה: 30 ביוני 2026</p>
    </InfoPage>
  );
}
