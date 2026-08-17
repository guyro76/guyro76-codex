import { useEffect, useState } from 'react';
import { PUZZLE_CATEGORY, pieceCount, puzzleById } from '../data/puzzles';
import { cachedAnswerImage, resolveAnswerImage, type ResolvedImage } from '../lib/answerImages';
import { isComplete } from '../lib/puzzlePieces';
import PuzzleScene from './PuzzleScene';

/**
 * לוח פאזל אחד.
 *
 * המבנה: **שכבה אחת של תמונה, ומעליה מכסים**. האיור נמצא מתחת ללוח
 * במלואו, והמשבצות שעדיין לא נאספו הן מכסים אטומים שמונחים עליו.
 * כך החלקים מתחברים לתמונה אחת רציפה בלי תפרים ובלי חישובי מיקום —
 * ואיסוף החלק האחרון פשוט מסיר את המכסה האחרון.
 *
 * למה איור ולא צילום: פאזל חייב להסתדר תמיד. איור נמצא בתוך החבילה
 * ולכן עובד גם בלי רשת. הצילום האמיתי מוויקיפדיה מוצג בנוסף,
 * כשהפאזל הושלם וכשיש רשת, עם קרדיט וקישור למקור.
 */
export default function PuzzleBoard({
  puzzleId,
  owned,
  highlight,
  compact = false
}: {
  puzzleId: string;
  owned: number[];
  /** החלק שהתקבל ממש עכשיו — מקבל הבהוב */
  highlight?: number;
  /** גרסה מקוצרת למסך תוצאות הסיבוב */
  compact?: boolean;
}) {
  const puzzle = puzzleById(puzzleId);
  const [photo, setPhoto] = useState<ResolvedImage | null>(null);

  const done = puzzle ? isComplete(puzzle, owned) : false;

  useEffect(() => {
    if (!puzzle) return;
    let live = true;
    setPhoto(null);
    void cachedAnswerImage(puzzle.name, PUZZLE_CATEGORY).then((hit) => {
      if (!live) return;
      if (hit) {
        setPhoto(hit);
        return;
      }
      /**
       * יוצאים לרשת רק בשביל צילום של פאזל שהושלם, ורק במסך המלא.
       * הצילום הוא תוספת, לא הלוח עצמו — ולכן הוא לא מצדיק בקשה
       * בכל פעם שמסך תוצאות נפתח.
       */
      if (compact || !done) return;
      void resolveAnswerImage(puzzle.name, PUZZLE_CATEGORY).then((found) => {
        if (live) setPhoto(found);
      });
    });
    return () => {
      live = false;
    };
  }, [puzzle, compact, done]);

  if (!puzzle) return null;

  const total = pieceCount(puzzle);
  const have = owned.length;
  const ownedSet = new Set(owned);

  return (
    <div className={`puzzle${compact ? ' compact' : ''}`}>
      <div className="row spread" style={{ marginBottom: 8 }}>
        <strong>
          <span aria-hidden>{puzzle.icon}</span> {puzzle.name}
          {!compact && <span className="puzzle-region"> · {puzzle.region}</span>}
        </strong>
        <span className={`puzzle-count${done ? ' done' : ''}`}>
          {done ? '✔ הושלם' : `${have} / ${total}`}
        </span>
      </div>

      <div
        className={`puzzle-grid${done ? ' done' : ''}`}
        style={{ aspectRatio: `${puzzle.cols} / ${puzzle.rows}` }}
        role="img"
        aria-label={
          done
            ? `פאזל ${puzzle.name} — הושלם`
            : `פאזל ${puzzle.name}: ${have} חלקים מתוך ${total}`
        }
      >
        <div className="puzzle-art">
          <PuzzleScene puzzleId={puzzle.id} cols={puzzle.cols} rows={puzzle.rows} />
        </div>

        <div
          className="puzzle-cover"
          style={{ gridTemplateColumns: `repeat(${puzzle.cols}, 1fr)` }}
        >
          {Array.from({ length: total }, (_, i) => {
            const has = ownedSet.has(i);
            return (
              <div
                key={i}
                className={`puzzle-cell${has ? ' has' : ''}${i === highlight ? ' just-won' : ''}`}
              >
                {!has && <span aria-hidden>❔</span>}
              </div>
            );
          })}
        </div>
      </div>

      {done && !compact && (
        <>
          <p className="puzzle-fact">💡 {puzzle.fact}</p>
          {photo && (
            <div className="puzzle-photo">
              <img src={photo.url} alt={`צילום של ${puzzle.name}`} loading="lazy" />
              <p className="puzzle-credit">
                כך זה נראה במציאות · {photo.attribution ?? 'ויקיפדיה/ויקישיתוף'}
                {photo.pageUrl && (
                  <>
                    {' · '}
                    <a href={photo.pageUrl} target="_blank" rel="noopener noreferrer">
                      עמוד המקור
                    </a>
                  </>
                )}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
