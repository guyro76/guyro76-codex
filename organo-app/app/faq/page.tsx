import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { faqItems } from "@/lib/faq";
import "./faq.css";

export const metadata: Metadata = {
  title: "שאלות נפוצות",
  description: "שאלות ותשובות על אורגנו, סריקות SEO GEO AEO, דוחות, אוגי, AI מקומי, פרטיות והרשאות.",
  alternates: { canonical: "/faq" },
};

const categories = [...new Set(faqItems.map((item) => item.category))];
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default function FaqPage() {
  return (
    <InfoPage eyebrow="מרכז הידע" title="שאלות נפוצות על אורגנו" intro="תשובות ברורות על הסריקות, הדוחות, אוגי, AI מקומי, פרטיות, אבטחה ועבודה בסוכנויות.">
      <div className="faq-directory" aria-label="קטגוריות שאלות נפוצות">
        {categories.map((category) => <a key={category} href={`#faq-${category}`}>{category}</a>)}
      </div>
      {categories.map((category) => (
        <section key={category} id={`faq-${category}`} className="faq-category">
          <h2>{category}</h2>
          <div className="faq-list">
            {faqItems.filter((item) => item.category === category).map((item) => (
              <details key={item.id} className="faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
      <section>
        <h2>לא מצאת תשובה?</h2>
        <p>פתח את אוגי בפינה השמאלית התחתונה ושאל אותו. אוגי מכיר את מאגר השאלות הנפוצות ואת הדוח הפעיל.</p>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </InfoPage>
  );
}
