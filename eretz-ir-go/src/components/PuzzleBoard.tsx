import { useEffect, useState } from 'react';
import { PUZZLE_CATEGORY, lookupTitle, pieceCount, puzzleById } from '../data/puzzles';
import { cachedAnswerImage, resolveAnswerImage, type ResolvedImage } from '../lib/answerImages';
import { puzzlePhoto, puzzlePhotoCredit, puzzlePhotoUrl } from '../data/puzzlePhotos';
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
 * מאיפה מגיעה התמונה, לפי סדר: **צילום ארוז בחבילה** (מיידי, עובד
 * בלי רשת), אחריו המטמון המקומי, אחריו הצינור החי מוויקיפדיה, ורק
 * בסוף איור הגיבוי. לכל אחת מהאפשרויות יש קרדיט משלה — אין מצב שבו
 * מוצג צילום בלי לומר מי צילם ותחת איזה רישיון.
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

  /**
   * הצילום האמיתי הוא תמונת הפאזל.
   *
   * קודם המטמון המקומי — כך הלוח נפתח מיד וגם בלי רשת. אם אין
   * במטמון והמסך הוא המסך המלא, מביאים מוויקישיתוף דרך אותו צינור
   * מאומת של תמונות התשובות (כותרת ערך זהה בדיוק, לא דף פירושונים,
   * לא מפה או סמל) ושומרים. מהפעם הבאה זה מקומי.
   *
   * הלוח המוקטן בתוצאות הסיבוב לא יוצא לרשת: הוא מציג מה שכבר
   * במטמון, ואם אין — את האיור.
   */
  useEffect(() => {
    if (!puzzle) return;
    let live = true;
    setPhoto(null);

    // צילום ארוז — אין מה לחכות ואין למי לפנות
    const bundled = puzzlePhoto(puzzle.id);
    if (bundled) {
      setPhoto({
        url: puzzlePhotoUrl(bundled),
        pageUrl: bundled.pageUrl,
        attribution: puzzlePhotoCredit(bundled)
      });
      return;
    }

    void cachedAnswerImage(lookupTitle(puzzle), PUZZLE_CATEGORY).then((hit) => {
      if (!live) return;
      if (hit) {
        setPhoto(hit);
        return;
      }
      if (compact) return;
      void resolveAnswerImage(lookupTitle(puzzle), PUZZLE_CATEGORY).then((found) => {
        if (live) setPhoto(found);
      });
    });
    return () => {
      live = false;
    };
  }, [puzzle, compact]);

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
          {photo ? (
            <img src={photo.url} alt={`צילום של ${puzzle.name}`} loading="lazy" />
          ) : (
            /* איור גיבוי: הפאזל חייב להסתדר גם כשאין רשת ואין צילום */
            <PuzzleScene puzzleId={puzzle.id} cols={puzzle.cols} rows={puzzle.rows} />
          )}
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

        {/* קרדיט קטן בתחתית התמונה עצמה: רצועה כהה וכתב בהיר ומודגש,
            כך שהוא נקרא מעל כל צילום ולא נעלם על שמיים בהירים */}
          {!compact && (
          <p className="puzzle-credit">
            {photo ? (
              <>
                📷 צילום · {photo.attribution ?? 'ויקיפדיה/ויקישיתוף'}
                {photo.pageUrl && (
                  <>
                    {' · '}
                    <a href={photo.pageUrl} target="_blank" rel="noopener noreferrer">
                      מקור
                    </a>
                  </>
                )}
              </>
            ) : (
              '✏️ איור — הצילום ייטען כשתהיה רשת'
            )}
          </p>
          )}
      </div>

      {done && !compact && <p className="puzzle-fact">💡 {puzzle.fact}</p>}

    </div>
  );
}
