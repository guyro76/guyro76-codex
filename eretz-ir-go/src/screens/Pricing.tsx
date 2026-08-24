import TopBar from '../components/TopBar';
import {
  FREE_FEATURES,
  PAID_FEATURES,
  PLANS,
  lifetimeBreakEvenMonths,
  perMonth,
  savingsPercent,
  type Plan
} from '../data/plans';

/**
 * מסך החבילות.
 *
 * מי שקורא אותו הוא הורה, לא ילד — ולכן הוא נכתב בשפה של הורה:
 * כמה זה עולה, לכמה זמן, ומה מקבלים. בלי ז'רגון של רמות.
 *
 * שתי החלטות שנראות קטנות ואינן:
 *  1. **החינם מוצג ראשון ובגאווה.** המשחק לא נחסם, וזה בידול אמיתי
 *     מול מתחרים — לא משהו להסתיר בתחתית העמוד.
 *  2. **המחיר לחודש מוצג לצד המחיר המלא.** זו ההשוואה שהורה עושה
 *     בראש ממילא; להציג רק סכום כולל מרגיש כמו הסתרה.
 *
 * הרכישה עצמה עדיין לא מחוברת — היא תעבור דרך החנות (App Store /
 * Google Play), ובאפליקציית ילדים היא חייבת לשבת מאחורי אזור ההורים
 * הנעול. עד שזה יחובר, הכפתור אומר את זה במפורש במקום להעמיד פנים.
 */
function PlanCard({ plan }: { plan: Plan }) {
  const monthly = perMonth(plan);
  const saved = savingsPercent(plan);

  return (
    <div className={`plan${plan.recommended ? ' best' : ''}`}>
      {plan.recommended && <span className="plan-flag">הכי משתלם</span>}

      <h3 className="plan-name">{plan.name}</h3>

      <div className="plan-price">
        <span className="plan-amount">₪{plan.price.toFixed(2)}</span>
      </div>

      <p className="plan-sub">
        {monthly ? `₪${monthly.toFixed(2)} לחודש` : (plan.note ?? '')}
      </p>

      {saved > 0 && <span className="plan-save">חיסכון {saved}%</span>}

      <button className={plan.recommended ? 'btn-gold' : 'btn-primary'} disabled>
        בקרוב בחנות
      </button>
    </div>
  );
}

export default function Pricing() {
  return (
    <div className="screen">
      <TopBar title="💎 החבילות" back="settings" />

      <div className="card">
        <h3 style={{ marginTop: 0 }}>🎈 גרסת חינם</h3>
        <p className="dim" style={{ margin: '2px 0 10px' }}>
          המשחק הבסיסי, בלי הגבלת זמן ובלי תשלום. מה שיש בה:
        </p>
        <ul className="plan-list">
          {FREE_FEATURES.map((f) => (
            <li key={f}>✅ {f}</li>
          ))}
        </ul>
      </div>

      <h2 className="center" style={{ marginBottom: 4 }}>מה מוסיפה החבילה בתשלום</h2>
      <div className="card">
        <ul className="plan-list two">
          {PAID_FEATURES.map((f) => (
            <li key={f}>💎 {f}</li>
          ))}
        </ul>
      </div>

      <div className="plan-grid">
        {PLANS.map((p) => (
          <PlanCard key={p.id} plan={p} />
        ))}
      </div>

      <p className="dim center" style={{ fontSize: '0.88rem' }}>
        “לכל החיים” מחזירה את עצמה אחרי כ-{lifetimeBreakEvenMonths()} חודשים מול המנוי השנתי.
      </p>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>לפני שקונים</h3>
        <ul className="plan-list">
          <li>הרכישה נעשית דרך החנות, והחיוב בחשבון החנות שלכם.</li>
          <li>מנוי לתקופה מתחדש מאליו; אפשר לבטל בהגדרות החנות בכל רגע.</li>
          <li>“לכל החיים” היא תשלום אחד ואינה מתחדשת.</li>
          <li>הרכישה מוגנת מאחורי אזור ההורים, כדי שילד לא יקנה בטעות.</li>
        </ul>
        <a href="/terms.html" target="_blank" rel="noopener noreferrer">
          <button className="btn-ghost">תנאי השימוש ↗</button>
        </a>
      </div>
    </div>
  );
}
