import { useEffect, useState } from 'react';
import Modal from './Modal';
import { cachedAnswerImage, reportWrongImage, resolveAnswerImage, withImage } from '../lib/answerImages';
import type { KnowledgeItem } from '../types';

/**
 * תמונה אמיתית של תשובה שנחשפה ואושרה.
 *
 * כללי האפיון שנשמרים כאן:
 * - מוצגות רק תמונות ממקור מזוהה (ויקיפדיה/ויקישיתוף) שעברו את שערי
 *   `imageVerify.ts`. תמונה בלי `source` לא תוצג בכלל — אין תמונות
 *   "סתם" ואין תמונות מיוצרות.
 * - הקרדיט והרישיון מוצגים לצד התמונה, ויש קישור לעמוד המקור.
 * - יש כפתור דיווח: אם בכל זאת הופיעה תמונה לא מתאימה, שחקן או הורה
 *   חוסמים אותה בלחיצה אחת והיא לא תחזור.
 * - תקלת טעינה (אין רשת, התמונה הוסרה) פשוט מסתירה את הרכיב.
 */
export default function AnswerImage({
  item,
  label,
  categoryId,
  size = 'thumb',
  discover = false
}: {
  item?: KnowledgeItem;
  label: string;
  /** הקטגוריה שבה נענתה התשובה — קריטי לאימות: "כלנית" בצומח ≠ בשם של בת */
  categoryId: string;
  size?: 'thumb' | 'large';
  /** מותר להביא תמונה חדשה מוויקיפדיה כשאין אחת. במסכי רשימה ארוכים
   *  משאירים false ומציגים רק מה שכבר במטמון המקומי. */
  discover?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [reported, setReported] = useState(false);
  const [resolved, setResolved] = useState<KnowledgeItem | undefined>(item);

  useEffect(() => {
    setResolved(item);
    setBroken(false);
    setReported(false);
    if (item?.image || !label.trim()) return;
    let live = true;
    const lookup = discover
      ? resolveAnswerImage(label, categoryId)
      : cachedAnswerImage(label, categoryId);
    void lookup.then((found) => {
      if (live && found) setResolved((prev) => withImage(prev ?? item, found, label));
    });
    return () => {
      live = false;
    };
  }, [item, label, categoryId, discover]);

  const report = async () => {
    await reportWrongImage(label, categoryId);
    setReported(true);
    setZoom(false);
  };

  const image = resolved?.image;
  if (!image?.thumbnailUrl || !image.source || broken || reported) return null;

  const px = size === 'large' ? 200 : 96;
  const sourceLink = resolved?.sources?.find((s) => s.startsWith('http'));

  return (
    <>
      <figure style={{ margin: '8px 0 0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <img
          src={image.thumbnailUrl}
          alt={label}
          loading="lazy"
          onError={() => setBroken(true)}
          onClick={() => setZoom(true)}
          style={{
            maxHeight: px,
            maxWidth: '100%',
            borderRadius: 12,
            border: '1px solid var(--border-glass)',
            cursor: 'zoom-in',
            objectFit: 'cover'
          }}
        />
        <figcaption className="dim" style={{ fontSize: '0.72rem', lineHeight: 1.4 }}>
          📷 {image.source}
          {image.license ? ` · ${image.license}` : ''}
        </figcaption>
      </figure>

      {zoom && (
        <Modal onClose={() => setZoom(false)}>
          <div className="center">
            <h2 style={{ marginTop: 0 }}>{label}</h2>
            <img
              src={image.url}
              alt={label}
              onError={() => setBroken(true)}
              style={{ maxWidth: '100%', maxHeight: '52vh', borderRadius: 14 }}
            />
            <p className="dim" style={{ fontSize: '0.8rem' }}>
              📷 מקור: {image.source}
              {image.author ? ` · ${image.author}` : ''}
              {image.license ? ` · רישיון: ${image.license}` : ''}
            </p>
            {sourceLink && (
              <p style={{ fontSize: '0.8rem' }}>
                <a href={sourceLink} target="_blank" rel="noopener noreferrer">
                  לעמוד המקור ↗
                </a>
              </p>
            )}
            <div className="row" style={{ justifyContent: 'center' }}>
              <button className="btn-primary" onClick={() => setZoom(false)}>
                סגירה
              </button>
              <button className="btn-small btn-ghost" onClick={() => void report()}>
                🚩 התמונה לא מתאימה
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
