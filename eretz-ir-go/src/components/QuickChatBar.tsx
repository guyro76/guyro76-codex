import { useState } from 'react';
import { useChallenge } from '../store/challengeStore';
import { QUICK_PHRASES, phraseById } from '../lib/quickChat';
import { sfx } from '../lib/sound';

/**
 * שורת ההודעות בתחתית מסך המשחק.
 *
 * מוצגת רק כשמשחקים אתגר של חבר — במצבים על מכשיר אחד השחקנים
 * יושבים זה ליד זה ואין למי לכתוב.
 *
 * שני חצאים: למעלה מה שהחבר אמר (משפט מוכן שהגיע כמזהה בקישור),
 * ולמטה בחירת משפט תשובה. **התשובה לא נשלחת עכשיו** — האתגר
 * אסינכרוני והחבר כבר סיים לשחק; היא נשמרת ונוסעת עם האתגר החוזר.
 * הכיתוב אומר את זה במפורש, כדי שילד לא יחשוב שהוא מנהל שיחה חיה.
 *
 * אין כאן תיבת הקלדה, ולא במקרה: ראו את ההסבר ב-`quickChat.ts`.
 */
export default function QuickChatBar() {
  const active = useChallenge((s) => s.active);
  const reply = useChallenge((s) => s.reply);
  const setReply = useChallenge((s) => s.setReply);
  const [open, setOpen] = useState(false);

  if (!active) return null;

  const said = phraseById(active.msg);
  const chosen = phraseById(reply);

  return (
    <div className="quick-chat">
      {said && (
        <p className="quick-chat-said">
          <strong>{active.by}:</strong> <span aria-hidden>{said.icon}</span> {said.text}
        </p>
      )}

      <div className="quick-chat-row">
        <button
          className="quick-chat-toggle"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {chosen ? (
            <>
              <span aria-hidden>{chosen.icon}</span> {chosen.text}
            </>
          ) : (
            '💬 להגיב'
          )}
        </button>
        {chosen && <span className="quick-chat-note">יישלח עם האתגר החוזר</span>}
      </div>

      {open && (
        <ul className="quick-chat-list">
          {QUICK_PHRASES.map((p) => (
            <li key={p.id}>
              <button
                className={reply === p.id ? 'quick-chat-pick on' : 'quick-chat-pick'}
                aria-pressed={reply === p.id}
                onClick={() => {
                  setReply(p.id);
                  sfx.select();
                  setOpen(false);
                }}
              >
                <span aria-hidden>{p.icon}</span> {p.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
