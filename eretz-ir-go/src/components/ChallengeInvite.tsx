import { useState } from 'react';
import { useApp } from '../store/appStore';
import { useGame } from '../store/gameStore';
import { useCapabilities } from '../store/authStore';
import { buildChallenge, challengeInviteText } from '../lib/challenge';
import { shareText, type ShareOutcome } from '../lib/share';
import { CATEGORIES } from '../data/categories';
import { sfx } from '../lib/sound';
import { QUICK_PHRASES, phraseById } from '../lib/quickChat';
import { useChallenge } from '../store/challengeStore';

/**
 * "לאתגר חבר" — הופך את הסיבוב שהרגע נגמר לקישור.
 *
 * מה שנשלח הוא האות, הקטגוריות והניקוד שלי — **לא התשובות**. ראו
 * את ההסבר המלא ב-`lib/challenge.ts`: מטען שנושא טקסט שילד הקליד
 * הוא ערוץ צ'אט, וזה אסור כאן.
 *
 * האתגר נבנה מהסיבוב האחרון בלבד, כי `submitted` מכיל אותו בלבד.
 * זה גם הדבר הנכון: אתגר הוא סיבוב אחד, לא משחק שלם.
 */
export default function ChallengeInvite() {
  const caps = useCapabilities();
  const navigate = useApp((s) => s.navigate);
  const game = useGame();
  const [state, setState] = useState<ShareOutcome | 'empty' | null>(null);
  /**
   * המשפט שנבחר בשורת ההודעות בזמן המשחק משמש כברירת מחדל: מי
   * שכבר בחר "כל הכבוד!" באמצע האתגר לא צריך לבחור שוב.
   */
  const replyFromGame = useChallenge((s) => s.reply);
  /**
   * שלושה מצבים, ולכן לא בוליאני: `null` = לא נגעו, ואז חל המשפט
   * שנבחר במשחק; `0` = ביטלו במפורש, ואז לא נשלח משפט (0 אינו
   * מזהה תקף ו-`buildChallenge` יסנן אותו); מספר אחר = הבחירה כאן.
   */
  const [messageId, setMessageId] = useState<number | null>(null);
  const chosen = messageId ?? replyFromGame;

  const me = game.players[0];
  if (!me) return null;

  // בלי אות אין מה לארוז — למשל כשמגיעים לכאן ממשחק שנקטע
  if (!game.letter) return null;

  if (!caps.multiplayer) {
    return (
      <div className="card challenge-locked">
        <h3 style={{ marginTop: 0 }}>🎯 לאתגר חבר</h3>
        <p className="dim" style={{ marginTop: 4 }}>
          שולחים לחבר קישור, הוא משחק את אותה אות ואותן קטגוריות, ורואים מי ניצח. בגרסה המלאה.
        </p>
        <button className="btn-gold" onClick={() => navigate('pricing')}>
          לצפייה בחבילות
        </button>
      </div>
    );
  }

  const send = async () => {
    const pointsByCategory: Record<string, number> = {};
    for (const a of me.submitted) {
      pointsByCategory[a.categoryId] = (pointsByCategory[a.categoryId] ?? 0) + a.totalScore;
    }

    const challenge = buildChallenge({
      nickname: me.profile.name,
      letter: game.letter,
      // הסדר נשמר לפי הסיבוב ששוחק, וסימון `custom` מגיע מהקטגוריה
      // עצמה — קטגוריה שההורה יצר תסונן בבנייה
      categories: game.categories.map((c) => ({
        id: c.id,
        custom: c.custom ?? !CATEGORIES.some((known) => known.id === c.id)
      })),
      seconds: game.settings.roundSeconds,
      pointsByCategory,
      messageId: chosen
    });

    if (!challenge) {
      setState('empty');
      return;
    }

    const outcome = await shareText(challengeInviteText(challenge));
    setState(outcome);
    if (outcome === 'shared' || outcome === 'copied') sfx.success();
  };

  return (
    <div className="card challenge-invite">
      <h3 style={{ marginTop: 0 }}>🎯 לאתגר חבר</h3>
      <p className="dim" style={{ marginTop: 4 }}>
        שולחים קישור, החבר משחק את אותה אות ואותן קטגוריות מתי שנוח לו — ורואה אם הצליח לעבור אותך.
      </p>
      {/* בחירת משפט לפני השליחה. רשימה סגורה ולא תיבת הקלדה —
          ההסבר המלא ב-quickChat.ts */}
      <p className="dim" style={{ margin: '10px 0 4px', fontSize: '0.86rem' }}>
        להוסיף משפט? (לא חובה)
      </p>
      <ul className="quick-chat-list">
        {QUICK_PHRASES.map((ph) => (
          <li key={ph.id}>
            <button
              className={chosen === ph.id ? 'quick-chat-pick on' : 'quick-chat-pick'}
              aria-pressed={chosen === ph.id}
              onClick={() => setMessageId(chosen === ph.id ? 0 : ph.id)}
            >
              <span aria-hidden>{ph.icon}</span> {ph.text}
            </button>
          </li>
        ))}
      </ul>

      <button className="btn-primary" onClick={() => void send()}>
        לשלוח אתגר 📤
      </button>

      {state && state !== 'cancelled' && (
        <p className={state === 'failed' || state === 'empty' ? 'bad' : 'dim'} role="status" style={{ marginBottom: 0 }}>
          {state === 'copied'
            ? '✅ הקישור הועתק — אפשר להדביק בוואטסאפ'
            : state === 'shared'
              ? '✅ נשלח!'
              : state === 'empty'
                ? 'אי אפשר לבנות אתגר מהסיבוב הזה — הוא כולו קטגוריות שיצרתם בעצמכם'
                : 'לא הצלחנו לשתף מהמכשיר הזה'}
        </p>
      )}

      <p className="dim" style={{ fontSize: '0.8rem', marginBottom: 0 }}>
        נשלחים האות, הקטגוריות, הניקוד שלך {phraseById(chosen) ? 'והמשפט שבחרת' : ''}. התשובות עצמן לא
        נשלחות, ואי אפשר לכתוב הודעה חופשית.
      </p>
    </div>
  );
}
