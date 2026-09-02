import { useState } from 'react';
import Modal from './Modal';

/**
 * "איך משחקים" — ההסבר הראשון.
 *
 * ## למה הוא נדרש דווקא כאן
 *
 * כל ישראלי יודע לשחק ארץ-עיר. מה שאיש לא יודע הוא מה **המשחק
 * הזה** מוסיף: 50 קטגוריות, רמזים בשלוש דרגות, קניית תשובה מקרדיט,
 * החלפת אות, חלקי פאזל ומשימות ביניים. מתחרה עם תשע קטגוריות ובלי
 * אף אחד מאלה באמת לא צריך הסבר — אנחנו כן.
 *
 * ## למה חלון ולא מסך
 *
 * מסך פתיחה חוסם עומד בין ילד לבין המשחק בשנייה הראשונה, וילד
 * שרוצה לשחק ילחץ "דלג" בלי לקרוא — כלומר ההסבר גם מפריע וגם לא
 * מושג. חלון שנפתח מכפתור, ונפתח **פעם אחת לבד** בכניסה הראשונה,
 * מגיע למי שרוצה אותו ולא חוסם את מי שלא.
 *
 * ## ארבעה עמודים, ולא יותר
 *
 * כל עמוד עונה על שאלה אחת שילד באמת שואל. הסבר ארוך מזה לא
 * נקרא — לא על ידי ילד ולא על ידי הורה.
 */

interface Page {
  icon: string;
  title: string;
  body: string;
}

export const HOW_TO_PAGES: Page[] = [
  {
    icon: '🎲',
    title: 'מגרילים אות',
    body: 'לוחצים על הגלגל, והוא בוחר אות. כל התשובות בסיבוב מתחילות באות הזו.'
  },
  {
    icon: '✍️',
    title: 'ממלאים מה שיודעים',
    body: 'ארץ, עיר, חי, צומח — ועוד 46 קטגוריות לבחירה. לא יודעים? זה בסדר, ממשיכים הלאה.'
  },
  {
    icon: '💡',
    title: 'ארצי עוזר, לא מספר',
    body: 'לחיצה על "רמז" נותנת רמז. עוד לחיצה — רמז גדול יותר. רק בסוף הוא מגלה את התשובה, ואז היא לא מזכה בנקודות.'
  },
  {
    icon: '🧩',
    title: 'אוספים תוך כדי',
    body: 'כל תשובה נכונה נכנסת לאוסף המילים עם תמונה ועובדה, ובסוף כל סיבוב נופל חלק פאזל של מקום בארץ.'
  }
];

export default function HowToPlay({ onClose }: { onClose: () => void }) {
  const [page, setPage] = useState(0);
  const last = page === HOW_TO_PAGES.length - 1;
  const p = HOW_TO_PAGES[page];

  return (
    <Modal onClose={onClose}>
      <div className="center">
        <div style={{ fontSize: '3rem' }} aria-hidden>
          {p.icon}
        </div>
        <h2 style={{ margin: '4px 0 8px' }}>{p.title}</h2>
        {/* role=status כדי שקורא מסך יקריא את העמוד החדש בהחלפה */}
        <p role="status" style={{ minHeight: '4.5em' }}>
          {p.body}
        </p>

        {/* נקודות ההתקדמות — כמה עמודים יש, ואיפה אנחנו */}
        <div className="howto-dots" aria-hidden>
          {HOW_TO_PAGES.map((_, i) => (
            <span key={i} className={i === page ? 'on' : undefined} />
          ))}
        </div>

        <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}>
          {page > 0 && (
            <button className="btn-ghost btn-small" onClick={() => setPage((n) => n - 1)}>
              → הקודם
            </button>
          )}
          <button className="btn-primary" onClick={() => (last ? onClose() : setPage((n) => n + 1))}>
            {last ? 'יאללה, משחקים!' : 'הבא ←'}
          </button>
        </div>

        {!last && (
          <button className="btn-ghost btn-small" style={{ marginTop: 6 }} onClick={onClose}>
            דילוג
          </button>
        )}
      </div>
    </Modal>
  );
}
