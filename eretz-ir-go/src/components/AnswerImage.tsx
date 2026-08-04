import { useEffect, useState } from 'react';
import Modal from './Modal';
import { cachedAnswerImage, resolveAnswerImage, withImage } from '../lib/answerImages';
import type { KnowledgeItem } from '../types';

/**
 * תמונה אמיתית של תשובה שנחשפה ואושרה.
 *
 * כללי האפיון שנשמרים כאן:
 * - מוצגות רק תמונות שהגיעו ממקור מזוהה (ויקיפדיה/ויקישיתוף). תמונה
 *   בלי `source` לא תוצג בכלל — אין תמונות "סתם" ואין תמונות מיוצרות.
 * - הקרדיט והרישיון מוצגים לצד התמונה, ויש קישור לעמוד המקור.
 * - תקלת טעינה (אין רשת, התמונה הוסרה) פשוט מסתירה את הרכיב.
 */
export default function AnswerImage({
  item,
  label,
  size = 'thumb',
  discover = false
}: {
  item?: KnowledgeItem;
  label: string;
  size?: 'thumb' | 'large';
  /** מותר להביא תמונה חדשה מוויקיפדיה כשאין אחת. במסכי רשימה ארוכים
   *  משאירים false ומציגים רק מה שכבר במטמון המקומי. */
  discover?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [resolved, setResolved] = useState<KnowledgeItem | undefined>(item);

  useEffect(() => {
    setResolved(item);
    setBroken(false);
    if (item?.image || !label.trim()) return;
    let live = true;
    const lookup = discover ? resolveAnswerImage(label) : cachedAnswerImage(label);
    void lookup.then((found) => {
      if (live && found) setResolved((prev) => withImage(prev ?? item, found, label));
    });
    return () => {
      live = false;
    };
  }, [item, label, discover]);

  const image = resolved?.image;
  if (!image?.thumbnailUrl || !image.source || broken) return null;

  const px = size === 'large' ? 200 : 96;
  const sourceLink = resolved?.sources?.find((s) => s.startsWith('http'));

  return (
    <>
      <figure
        style={{ margin: '8px 0 0', display: 'flex', gap: 10, alignItems: 'flex-start' }}
      >
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
              style={{ maxWidth: '100%', maxHeight: '58vh', borderRadius: 14 }}
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
            <button className="btn-primary" onClick={() => setZoom(false)}>
              סגירה
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
