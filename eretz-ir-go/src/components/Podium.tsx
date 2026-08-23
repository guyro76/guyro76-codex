import Avatar from './Avatar';
import type { PlayerState } from '../store/gameStore';

/**
 * פודיום הזוכים בסוף משחק.
 *
 * למה פודיום ולא עוד רשימה: מקום ראשון ברשימה נראה כמו השורה
 * הראשונה, וזה לא מה שילד מרגיש כשהוא מנצח. גובה המדרגה אומר את
 * המקום בלי לקרוא כלום — גם ילד שעוד לא קורא טוב מבין מיד מי ניצח.
 *
 * **בחדר רואים את השמות.** זה מכוון: כשמשחקים יחד צריך לדעת מול מי,
 * וכאן זה חל רק על מי שממש שיחק במשחק הזה — לא על רשימת ילדים
 * שסתם קיימים במכשיר.
 *
 * הסדר על המסך הוא הסדר המוכר מהאולימפיאדה — שני, ראשון, שלישי —
 * ולא לפי סדר קריאה. לכן הוא נקבע במפורש ולא מושפע מכיוון הדף.
 */
export default function Podium({ players }: { players: PlayerState[] }) {
  const top = players.slice(0, 3);
  if (top.length === 0) return null;

  // שני · ראשון · שלישי. כשיש פחות משלושה, המקומות החסרים פשוט נעדרים.
  const order = [1, 0, 2].filter((i) => i < top.length);

  return (
    <div className="podium" role="list" aria-label="פודיום הזוכים">
      {order.map((place) => {
        const p = top[place];
        return (
          <div key={place} className={`podium-slot place-${place + 1}`} role="listitem">
            <div className="podium-player">
              <span className="podium-medal" aria-hidden>
                {place === 0 ? '🥇' : place === 1 ? '🥈' : '🥉'}
              </span>
              <div className="podium-avatar" style={{ borderColor: p.profile.color }}>
                <Avatar
                  avatar={p.profile.avatar}
                  photo={p.profile.photo}
                  name={p.profile.name}
                  size={place === 0 ? 52 : 42}
                />
              </div>
              <strong className="podium-name">{p.profile.name}</strong>
              <span className="podium-score">{p.totalScore} נק׳</span>
            </div>
            <div className="podium-step">
              <span aria-hidden>{place + 1}</span>
              <span className="sr-only">מקום {place + 1}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
