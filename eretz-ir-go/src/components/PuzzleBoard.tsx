import { useEffect, useState } from 'react';
import { PUZZLE_CATEGORY, pieceCount, puzzleById } from '../data/puzzles';
import { cachedAnswerImage, resolveAnswerImage, type ResolvedImage } from '../lib/answerImages';
import { isComplete } from '../lib/puzzlePieces';

/**
 * לוח פאזל אחד.
 *
 * המשבצות הן חלונות אל אותה תמונה: כל תא מציג את התמונה כרקע
 * ממוקם (`background-position`), כך שחלק שנאסף חושף בדיוק את
 * הריבוע שלו והחלקים מתחברים לתמונה אחת רציפה. תא שלא נאסף נשאר
 * כהה עם סימן שאלה.
 *
 * התמונה מגיעה מאותו צינור מאומת של תמונות התשובות, כולל הקרדיט
 * והקישור לעמוד המקור. אם היא לא נמצאה — אין תמונה שגויה ואין
 * תמונה מומצאת: הלוח מוצג במסגרות ריקות עם הסבר.
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
  const [image, setImage] = useState<ResolvedImage | null>(null);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!puzzle) return;
    let live = true;
    setImage(null);
    setTried(false);
    // קודם המטמון המקומי — כך הפאזל נפתח מיד וגם בלי רשת
    void cachedAnswerImage(puzzle.name, PUZZLE_CATEGORY).then((hit) => {
      if (!live) return;
      if (hit) {
        setImage(hit);
        setTried(true);
        return;
      }
      /**
       * חיפוש תמונה חדשה נעשה רק במסך הפאזלים.
       *
       * הלוח המוקטן בתוצאות הסיבוב הוא 130 פיקסלים ומוצג לרגע —
       * לצאת בשבילו לרשת זה בזבוז, ובעיקר זה מכניס בקשה רשתית לתוך
       * מסך שכל תפקידו להראות ניקוד. החלקים נשמרים בכל מקרה.
       */
      if (compact) {
        setTried(true);
        return;
      }
      void resolveAnswerImage(puzzle.name, PUZZLE_CATEGORY).then((found) => {
        if (!live) return;
        setImage(found);
        setTried(true);
      });
    });
    return () => {
      live = false;
    };
  }, [puzzle, compact]);

  if (!puzzle) return null;

  const total = pieceCount(puzzle);
  const have = owned.length;
  const done = isComplete(puzzle, owned);
  const ownedSet = new Set(owned);

  return (
    <div className={`puzzle${compact ? ' compact' : ''}`}>
      <div className="row spread" style={{ marginBottom: 8 }}>
        <strong>
          <span aria-hidden>{puzzle.icon}</span> {puzzle.name}
          {!compact && <span className="dim"> · {puzzle.region}</span>}
        </strong>
        <span className={done ? 'gold' : 'dim'} style={{ fontSize: '0.9rem' }}>
          {done ? '✔ הושלם' : `${have} / ${total}`}
        </span>
      </div>

      <div
        className={`puzzle-grid${done ? ' done' : ''}`}
        style={{
          gridTemplateColumns: `repeat(${puzzle.cols}, 1fr)`,
          aspectRatio: `${puzzle.cols} / ${puzzle.rows}`
        }}
        role="img"
        aria-label={`פאזל ${puzzle.name}: ${have} חלקים מתוך ${total}`}
      >
        {Array.from({ length: total }, (_, i) => {
          const col = i % puzzle.cols;
          const row = Math.floor(i / puzzle.cols);
          const has = ownedSet.has(i);
          return (
            <div
              key={i}
              className={`puzzle-cell${has ? ' has' : ''}${i === highlight ? ' just-won' : ''}`}
              style={
                has && image
                  ? {
                      backgroundImage: `url(${image.url})`,
                      backgroundSize: `${puzzle.cols * 100}% ${puzzle.rows * 100}%`,
                      // חלוקה ב-(n-1) כי 0% ו-100% הם הקצוות, לא הצעד
                      backgroundPosition: `${puzzle.cols > 1 ? (col / (puzzle.cols - 1)) * 100 : 50}% ${
                        puzzle.rows > 1 ? (row / (puzzle.rows - 1)) * 100 : 50
                      }%`
                    }
                  : undefined
              }
            >
              {!has && <span aria-hidden>❔</span>}
              {has && !image && tried && <span aria-hidden>🧩</span>}
            </div>
          );
        })}
      </div>

      {done && !compact && <p style={{ margin: '8px 0 0', fontSize: '0.9rem' }}>💡 {puzzle.fact}</p>}

      {compact ? null : image ? (
        <p className="dim" style={{ margin: '6px 0 0', fontSize: '0.72rem' }}>
          {image.attribution ?? 'ויקיפדיה/ויקישיתוף'}
          {image.pageUrl && (
            <>
              {' · '}
              <a href={image.pageUrl} target="_blank" rel="noopener noreferrer">
                עמוד המקור
              </a>
            </>
          )}
        </p>
      ) : (
        /* רק בלוח שכבר התחיל: על לוח ריק ההערה היא רעש, ובמסך עם
           שמונה לוחות היא חוזרת שמונה פעמים */
        tried &&
        have > 0 && (
          <p className="dim" style={{ margin: '6px 0 0', fontSize: '0.75rem' }}>
            התמונה תיטען כשתהיה רשת — החלקים שאספתם נשמרים בכל מקרה.
          </p>
        )
      )}
    </div>
  );
}
