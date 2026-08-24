import { useEffect } from 'react';
import { useGame } from '../store/gameStore';
import { useChallenge } from '../store/challengeStore';
import { CATEGORIES } from '../data/categories';
import { compareToChallenge } from '../lib/challenge';
import { announce } from '../lib/announce';
import { sfx } from '../lib/sound';

/**
 * תוצאת האתגר — אני מול החבר ששלח אותו.
 *
 * ההשוואה היא לפי קטגוריה ולא רק בסך הכול, כי שם נמצא כל הכיף:
 * "הוא קיבל 10 על 'חי' ואני 5". אין כאן את התשובות שלו, ובכוונה —
 * רק המספרים נסעו בקישור.
 */
export default function ChallengeResult() {
  const active = useChallenge((s) => s.active);
  const game = useGame();
  const me = game.players[0];

  const result = active && me ? compareToChallenge(active, me.totalScore) : null;

  useEffect(() => {
    if (!result || !active) return;
    // מוכרז פעם אחת: מי שלא רואה צריך לדעת מה קרה בלי לסרוק טבלה
    announce(
      result.outcome === 'win'
        ? `ניצחת את ${active.by}! ${result.mine} מול ${result.theirs}`
        : result.outcome === 'lose'
          ? `${active.by} ניצח. ${result.mine} מול ${result.theirs}`
          : `תיקו מול ${active.by}, ${result.mine} נקודות לכל אחד`
    );
    if (result.outcome === 'win') sfx.fanfare();
    else sfx.select();
  }, [result?.outcome, result?.mine, result?.theirs, active?.by]);

  if (!active || !me || !result) return null;

  /** ניקוד שלי לפי קטגוריה, כדי להעמיד מול המספרים שהגיעו בקישור */
  const minePerCategory = new Map<string, number>();
  for (const a of me.submitted) {
    minePerCategory.set(a.categoryId, (minePerCategory.get(a.categoryId) ?? 0) + a.totalScore);
  }

  const headline =
    result.outcome === 'win'
      ? `ניצחת את ${active.by}! 🏆`
      : result.outcome === 'lose'
        ? `${active.by} הוביל הפעם`
        : `תיקו מול ${active.by} 🤝`;

  return (
    <div className="card challenge-result">
      {/* הקונפטי כאן ולא במסך התוצאות: באתגר "ניצחת" נקבע מול החבר,
          ולא מזה שסיימת סיבוב יחיד */}
      {result.outcome === 'win' && (
        <div className="confetti" aria-hidden>
          🎉🏆🎉
        </div>
      )}
      <p className="dim" style={{ margin: 0 }}>אתגר · האות {active.letter}</p>
      <h2 style={{ margin: '4px 0 10px' }}>{headline}</h2>

      <div className="challenge-scores">
        <div className={result.outcome === 'win' ? 'challenge-side winner' : 'challenge-side'}>
          <span className="challenge-name">{me.profile.name}</span>
          <strong className="challenge-total">{result.mine}</strong>
        </div>
        <span className="challenge-vs" aria-hidden>
          ⚔️
        </span>
        <div className={result.outcome === 'lose' ? 'challenge-side winner' : 'challenge-side'}>
          <span className="challenge-name">{active.by}</span>
          <strong className="challenge-total">{result.theirs}</strong>
        </div>
      </div>

      {result.outcome !== 'tie' && (
        <p className="dim" style={{ marginTop: 0 }}>
          {result.gap === 1 ? 'בהפרש נקודה אחת' : `בהפרש ${result.gap} נקודות`}
        </p>
      )}

      <table className="challenge-table">
        <thead>
          <tr>
            <th>קטגוריה</th>
            <th>{me.profile.name}</th>
            <th>{active.by}</th>
          </tr>
        </thead>
        <tbody>
          {active.cats.map((id, i) => {
            const cat = CATEGORIES.find((c) => c.id === id);
            const mineHere = minePerCategory.get(id) ?? 0;
            const theirsHere = active.pts[i] ?? 0;
            return (
              <tr key={id}>
                <td>
                  <span aria-hidden>{cat?.icon ?? '·'}</span> {cat?.name ?? id}
                </td>
                <td className={mineHere > theirsHere ? 'gold' : undefined}>{mineHere}</td>
                <td className={theirsHere > mineHere ? 'gold' : undefined}>{theirsHere}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
