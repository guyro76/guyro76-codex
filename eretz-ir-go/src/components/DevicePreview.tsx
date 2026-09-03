import { useEffect, useState } from 'react';
import { DEVICES, previewScale, type Device } from '../lib/devicePreview';

/**
 * תצוגה מקדימה של המשחק ברוחבי מסך שונים — למנהל בלבד.
 *
 * הצורך: אני בודק את ההתאמה למכשירים בבדיקות אוטומטיות, אבל מנהל
 * שרוצה *לראות* איך המשחק נראה בטאבלט צריך טאבלט. כאן הוא רואה את
 * המשחק האמיתי, חי, ברוחב שנבחר — מתוך הטלפון שבידו.
 *
 * המשחק נטען ב-iframe מאותו מקור בדיוק, ולכן זו לא הדמיה אלא
 * האפליקציה עצמה. היא מוצגת ברוחב המלא של המכשיר המדומה ומוקטנת
 * בקנה מידה כדי להיכנס למסך — כך הפריסה נשארת נאמנה, ורק הגודל
 * הנראה משתנה.
 */
export default function DevicePreview() {
  const [device, setDevice] = useState<Device | null>(null);
  /** מפתח שמכריח טעינה מחדש של המסגרת בלחיצה על "רענון" */
  const [nonce, setNonce] = useState(0);
  const [viewport, setViewport] = useState(() =>
    typeof window === 'undefined' ? 360 : window.innerWidth
  );

  // סיבוב הטלפון משנה את הרוחב הזמין; בלי זה המסגרת נשארת בקנה
  // המידה של המצב הקודם ויוצאת מהמסך.
  useEffect(() => {
    const onResize = () => setViewport(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const scale = device ? previewScale(device, viewport) : 1;

  return (
    <div className="card" style={{ marginTop: 14 }}>
      <strong>🖥️ תצוגה מקדימה במכשירים</strong>
      <p className="dim" style={{ margin: '4px 0 12px', fontSize: '0.88rem' }}>
        המשחק האמיתי, ברוחב של המכשיר שנבחר. שימושי כדי לראות איך זה נראה בטאבלט או במחשב
        בלי להחזיק אחד ביד.
      </p>

      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        {DEVICES.map((d) => (
          <button
            key={d.id}
            className={`chip${device?.id === d.id ? ' on' : ''}`}
            aria-pressed={device?.id === d.id}
            onClick={() => setDevice(device?.id === d.id ? null : d)}
          >
            {d.icon} {d.name} · {d.width}px
          </button>
        ))}
        {device && (
          <button className="btn-small btn-ghost" onClick={() => setNonce((n) => n + 1)}>
            🔄 רענון
          </button>
        )}
      </div>

      {device && (
        <>
          <div
            className="device-frame"
            style={{
              // הגובה נקבע לפי הגובה המוקטן, אחרת נשאר שטח ריק ענק מתחת
              height: device.height * scale,
              marginTop: 14
            }}
          >
            <iframe
              key={`${device.id}-${nonce}`}
              title={`תצוגה מקדימה — ${device.name}`}
              src="./"
              width={device.width}
              height={device.height}
              style={{ transform: `scale(${scale})` }}
            />
          </div>
          {/* סימן הכפל הוא תו ניטרלי גם בלי רווחים סביבו, ולכן שני
              הממדים התחלפו על המסך: 390×780 הוצג כ-780×390. dir="ltr"
              מבודד את הצמד ומחזיר לו את סדר הקריאה שלו. */}
          <p className="dim" style={{ fontSize: '0.8rem', marginBottom: 0 }}>
            <span dir="ltr">
              {device.width}×{device.height}
            </span>{' '}
            · מוצג ב-{Math.round(scale * 100)}% מהגודל
          </p>
        </>
      )}
    </div>
  );
}
