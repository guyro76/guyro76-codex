import { useMemo, useState } from 'react';

/**
 * שער הורים לפני תוכן מסחרי.
 *
 * ## למה זה חובה ולא נחמדות
 *
 * מדיניות Google Play Families דורשת שקריאה לפעולה מסחרית — מחירון,
 * "לרכישה", שדרוג — לא תהיה נגישה לילד ישירות. אצלנו לחיצה על מצב
 * משחק נעול שלחה את הילד **ישר למסך מחירים**, בלי שום מחסום.
 *
 * ## למה תרגיל ולא סיסמה
 *
 * במשחק כבר יש קוד הורה (`Parent.tsx`), אבל הוא לא מתאים לתפקיד
 * הזה: הקוד נקבע על ידי **מי שמגיע ראשון**, כלומר ילד סקרן יכול
 * לקבוע אותו בעצמו. שער שילד יכול לפתוח אינו שער.
 *
 * תרגיל כפל דו-ספרתי הוא הפתרון שגוגל עצמה מציעה: מבוגר פותר אותו
 * בשנייה, ילד בגיל היעד של המשחק — לא.
 *
 * ## למה זה לא נזכר
 *
 * השער נפתח **לפעם הזו בלבד** ולא נשמר. שער שנפתח פעם אחת ונשאר
 * פתוח הוא שער שנפתח פעם אחת.
 *
 * ## שני שימושים
 *
 * `commerce` (ברירת מחדל) — מסך מלא לפני המחירון.
 * `external` — חלון קטן לפני יציאה מהאפליקציה לאתר חיצוני, דרך
 * `GatedLink`. אותה מדיניות Families דורשת גם את זה: קישור החוצה
 * אינו נגיש לילד ישירות.
 */
export default function ParentGate({
  onPass,
  onCancel,
  purpose = 'commerce'
}: {
  onPass: () => void;
  onCancel: () => void;
  purpose?: 'commerce' | 'external';
}) {
  const external = purpose === 'external';
  // נבחר פעם אחת לכל הצגה של השער, כדי שהתשובה לא תשתנה תוך כדי הקלדה
  const quiz = useMemo(() => {
    const a = 3 + Math.floor(Math.random() * 7); // 3..9
    const b = 11 + Math.floor(Math.random() * 9); // 11..19
    return { a, b, answer: a * b };
  }, []);

  const [entered, setEntered] = useState('');
  const [wrong, setWrong] = useState(false);

  const check = () => {
    if (Number(entered) === quiz.answer) {
      onPass();
      return;
    }
    setWrong(true);
    setEntered('');
  };

  const card = (
      <div className="card" style={{ maxWidth: 380, margin: '0 auto' }}>
        <div style={{ fontSize: '2.6rem' }} aria-hidden>
          🔒
        </div>
        <h2 style={{ marginTop: 6 }}>רגע, שאלה להורים</h2>
        <p className="dim">
          {external
            ? 'הקישור הזה יוצא מהמשחק אל אתר אחר, והוא מיועד למבוגר.'
            : 'באזור הזה יש מחירים ומנויים, והוא מיועד למבוגר.'}{' '}
          כדי להמשיך — כמה זה{' '}
          <strong dir="ltr">
            {quiz.a} × {quiz.b}
          </strong>
          ?
        </p>

        <input
          type="text"
          inputMode="numeric"
          dir="ltr"
          aria-label={`כמה זה ${quiz.a} כפול ${quiz.b}`}
          data-autofocus
          value={entered}
          onChange={(ev) => {
            setEntered(ev.target.value.replace(/\D/g, '').slice(0, 4));
            setWrong(false);
          }}
          onKeyDown={(ev) => ev.key === 'Enter' && check()}
        />

        {wrong && (
          <p className="bad" role="alert" style={{ fontWeight: 700 }}>
            לא מדויק. אפשר לנסות שוב.
          </p>
        )}

        <div className="row" style={{ justifyContent: 'center', marginTop: 10 }}>
          <button className="btn-primary" disabled={!entered} onClick={check}>
            ממשיכים
          </button>
          <button className="btn-ghost btn-small" onClick={onCancel}>
            {external ? 'ביטול' : '← חזרה למשחק'}
          </button>
        </div>
      </div>
  );

  // בחלון (`external`) אין צורך במסך מלא — החלון עצמו כבר מרכז
  return external ? card : <div className="screen center">{card}</div>;
}
