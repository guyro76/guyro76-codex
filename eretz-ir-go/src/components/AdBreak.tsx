import { useEffect, useState } from 'react';
import { AD_HOLD_SECONDS, adProvider, type AdCreative, type AdSlot } from '../lib/ads';
import { useApp } from '../store/appStore';

/**
 * הפסקת פרסומת בין שלבים.
 *
 * מוצגת רק בגרסה החינמית. הפריסה מכוונת למנוע לחיצה בטעות: המודעה
 * למעלה, כפתור ההמשך מופרד ממנה למטה, והוא נפתח רק אחרי השהיה —
 * כך שילד שמקיש ברצף לא נוחת על המודעה. זו דרישה של Google Play
 * ולא רק נימוס.
 *
 * `onDone` נקרא כשממשיכים. אם אין מודעה להציג, הרכיב קורא לו מיד
 * ולא מציג כלום — פרסומת שלא נטענה לא אמורה לעצור ילד באמצע משחק.
 */
export default function AdBreak({ slot, onDone }: { slot: AdSlot; onDone: () => void }) {
  const navigate = useApp((s) => s.navigate);
  const [ad, setAd] = useState<AdCreative | null>(null);
  const [left, setLeft] = useState(AD_HOLD_SECONDS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    void adProvider()
      .request(slot)
      .then((creative) => {
        if (!live) return;
        if (!creative) {
          onDone();
          return;
        }
        setAd(creative);
        setReady(true);
      })
      .catch(() => onDone());
    return () => {
      live = false;
    };
  }, [slot, onDone]);

  useEffect(() => {
    if (!ready) return;
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [ready, left]);

  if (!ad) return null;

  return (
    <div className="screen center ad-break">
      {/* התווית קודמת למודעה בסדר הקריאה: ילד צריך לדעת שזו מודעה
          לפני שהוא קורא אותה, לא אחרי */}
      <p className="ad-label">פרסומת</p>

      <div className="ad-card">
        <div style={{ fontSize: '2.6rem' }} aria-hidden>
          {ad.icon}
        </div>
        <h2 className="ad-headline">{ad.headline}</h2>
        <p className="ad-body">{ad.body}</p>
        <button className="btn-gold" onClick={() => navigate('pricing')}>
          {ad.cta}
        </button>
      </div>

      {/* מופרד מהמודעה במרווח אמיתי, כדי שלחיצה על "המשך" לא תיפול
          על המודעה בטעות */}
      <div className="ad-continue">
        <button className="btn-primary" disabled={left > 0} onClick={onDone}>
          {left > 0 ? `אפשר להמשיך בעוד ${left}` : 'ממשיכים למשחק →'}
        </button>
        <p className="dim" style={{ fontSize: '0.82rem', margin: 0 }}>
          בגרסה המלאה אין פרסומות.
        </p>
      </div>
    </div>
  );
}
