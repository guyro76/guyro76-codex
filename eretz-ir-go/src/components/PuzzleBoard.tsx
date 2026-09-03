import { useEffect, useState } from 'react';
import { PUZZLE_CATEGORY, lookupTitle, pieceCount, puzzleById } from '../data/puzzles';
import { cachedAnswerImage, resolveAnswerImage, type ResolvedImage } from '../lib/answerImages';
import { puzzlePhoto, puzzlePhotoUrl } from '../data/puzzlePhotos';
import { isComplete } from '../lib/puzzlePieces';
import { jigsawCut } from '../lib/jigsaw';
import PuzzleScene from './PuzzleScene';
import { licenseDeedUrl } from '../lib/imageCredit';

/**
 * לוח פאזל אחד.
 *
 * המבנה: **שכבה אחת של תמונה, ומעליה מכסים**. התמונה נמצאת מתחת
 * ללוח במלואה, והחלקים שעדיין לא נאספו הם מכסים אטומים שמונחים
 * עליה. כך החלקים מתחברים לתמונה אחת רציפה בלי תפרים ובלי חישובי
 * מיקום — ואיסוף החלק האחרון פשוט מסיר את המכסה האחרון.
 *
 * המכסים הם **צורות פאזל אמיתיות** ולא ריבועים: `jigsawCut` גוזר את
 * הלוח פעם אחת לגבולות עם פינים ושקעים, ושני שכנים מקבלים את אותו
 * גבול — אחד הפוך — כך שהם מתחברים בלי רווח. הגזירה נגזרת ממזהה
 * הפאזל, ולכן היא קבועה: ילד שחוזר מחר רואה את אותם חלקים.
 *
 * מאיפה מגיעה התמונה, לפי סדר: **צילום ארוז בחבילה** (מיידי, עובד
 * בלי רשת), אחריו המטמון המקומי, אחריו הצינור החי מוויקיפדיה, ורק
 * בסוף איור הגיבוי. לכל אחת מהאפשרויות יש קרדיט משלה — אין מצב שבו
 * מוצג צילום בלי לומר מי צילם ותחת איזה רישיון.
 */
/**
 * מערכת הצירים של הגזירה. שרירותית לגמרי — ה-SVG נמתח על התמונה —
 * אבל חייבת להיות קבועה כדי שהמסלולים יהיו זהים בכל מסך.
 */
const CUT_W = 600;
const CUT_H = 400;

export default function PuzzleBoard({
  puzzleId,
  owned,
  highlight,
  compact = false,
  onBuy
}: {
  puzzleId: string;
  owned: number[];
  /** החלק שהתקבל ממש עכשיו — מקבל הבהוב */
  highlight?: number;
  /** גרסה מקוצרת למסך תוצאות הסיבוב */
  compact?: boolean;
  /** אם ניתן — לחיצה על חלק חסר מציעה לקנות אותו */
  onBuy?: (piece: number) => void;
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
        credit: {
          author: bundled.author,
          license: bundled.license,
          licenseUrl: licenseDeedUrl(bundled.license)
        },
        // הצילומים הארוזים נבחרו ידנית מוויקישיתוף
        source: 'ויקישיתוף'
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
  const cut = jigsawCut({
    cols: puzzle.cols,
    rows: puzzle.rows,
    width: CUT_W,
    height: CUT_H,
    seed: puzzle.id
  });

  return (
    <div className={`puzzle${compact ? ' compact' : ''}`}>
      <div className="row spread" style={{ marginBottom: 8 }}>
        <strong>
          <span aria-hidden>{puzzle.icon}</span> {puzzle.name}
          {!compact && <span className="puzzle-region"> · {puzzle.region}</span>}
        </strong>
        {/* בלי רווחים סביב הלוכסן: בהקשר ימין-לשמאל רווח הופך את
            הלוכסן למפריד ניטרלי, ואז שני המספרים מתחלפים על המסך —
            ילד עם 3 חלקים מתוך 9 היה רואה "9 / 3". "3/9" נדבק
            למספר אחד ונשאר בסדר הנכון, ונשאר קצר מספיק לתג. */}
        <span className={`puzzle-count${done ? ' done' : ''}`}>
          {done ? '✔ הושלם' : `${have}/${total}`}
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

        {/* המכסים כשכבת SVG אחת מעל התמונה. viewBox קבוע ו-preserveAspectRatio
            כבוי — כך הגזירה נמתחת בדיוק על התמונה בכל רוחב מסך. */}
        <svg
          className="puzzle-cover"
          viewBox={`0 0 ${CUT_W} ${CUT_H}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          {Array.from({ length: total }, (_, i) => {
            const has = ownedSet.has(i);
            if (has && i !== highlight) return null;
            const path = cut.piecePath(i);
            return has ? (
              // חלק שהתקבל ממש עכשיו — מהבהב רגע ואז נעלם
              <path key={i} d={path} className="puzzle-piece just-won" />
            ) : onBuy ? (
              <path
                key={i}
                d={path}
                className="puzzle-piece missing buyable"
                role="button"
                tabIndex={0}
                aria-label={`קנו את החלק החסר מספר ${i + 1}`}
                onClick={() => onBuy(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onBuy(i);
                  }
                }}
              />
            ) : (
              <path key={i} d={path} className="puzzle-piece missing" />
            );
          })}
        </svg>

      </div>

      {/*
        הקרדיט **מתחת** ללוח ולא עליו.
        קודם הוא ישב כרצועה על גבי התמונה, עם `white-space: nowrap`
        ו-`text-overflow: ellipsis` — וברוחב טלפון (הלוח היה 116px)
        זה הפיק "📷 ... BY-SA 4.0" ו-"דן סיידה · 0…". קרדיט קטוע
        אינו קרדיט, ובדיוק אותו כלל שאוסר להציג תמונה בלי ייחוס
        אוסר להציג ייחוס שאי אפשר לקרוא. מתחת ללוח יש שורה שלמה,
        הטקסט נשבר לשתי שורות במקום להיחתך, ואין הימור על ניגודיות
        מול שמיים בהירים.
      */}
      {/*
        גם בלוח המוקטן שבתוצאות הסיבוב.
        קודם הקרדיט הופיע רק במסך הפאזלים, והכרטיס "קיבלתם חלק
        פאזל" הציג צילום ברישיון CC BY-SA **בלי שום ייחוס**. אותו
        כלל שאוסר להציג תמונת תשובה בלי קרדיט חל גם כאן — מסך אחר
        אינו רישיון אחר.
      */}
      {have > 0 && (
          <p className={`puzzle-credit${compact ? ' compact' : ''}`}>
            {photo ? (
              <>
                {/* הקרדיט המלא שהרישיון דורש: יוצר, שם הרישיון עם
                    קישור לנוסח, קישור למקור, וציון שהתמונה נחתכה —
                    הפאזל חותך אותה לחלקים, וזה שינוי לכל דבר */}
                📷 {photo.credit.author} ·{' '}
                {photo.credit.licenseUrl ? (
                  <a href={photo.credit.licenseUrl} target="_blank" rel="noopener noreferrer">
                    {photo.credit.license}
                  </a>
                ) : (
                  photo.credit.license
                )}
                {' · התמונה מוצגת חתוכה'}
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

      {done && !compact && <p className="puzzle-fact">💡 {puzzle.fact}</p>}

    </div>
  );
}
