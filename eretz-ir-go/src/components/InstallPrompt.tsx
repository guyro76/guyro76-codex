import { useEffect, useState } from 'react';
import { getInstallEvent, onInstallChange, runInstallPrompt } from '../lib/installPrompt';

/**
 * הצעה להתקין את המשחק כאפליקציה במסך הבית.
 *
 * למה זה שווה: מהמסך הבית המשחק נפתח במסך מלא, בלי שורת כתובת,
 * ונטען מיידית גם בלי רשת. ילד לא יודע לחפש "הוסף למסך הבית"
 * בתפריט הדפדפן — צריך להציע לו.
 *
 * שני כללים שנשמרים כאן:
 * 1. **מציעים פעם אחת.** מי שסגר לא יראה שוב, לעולם. באנר חוזר
 *    בכל כניסה הוא בדיוק מה שגורם לאנשים למחוק אפליקציות.
 * 2. **לא מפריעים באמצע משחק.** הרכיב מוצג רק במסך הבית.
 *
 * באייפון אין `beforeinstallprompt` בכלל, ולכן שם מוצגת הדרכה
 * קצרה במקום כפתור — עדיף מלא להציע כלום למחצית מהמשתמשים.
 *
 * האירוע עצמו נלכד ב-`lib/installPrompt`, שמאזין כבר בעליית
 * האפליקציה. הרכיב הזה רק שואל אותו — כי עד שהוא נטען, האירוע
 * כבר חלף.
 */
const DISMISSED_KEY = 'eig-install-dismissed';

function alreadyInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari באייפון לא תומך ב-display-mode ומסמן אחרת
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
}

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1';
  } catch {
    return false; // מצב פרטי — פשוט מציעים
  }
}

export default function InstallPrompt() {
  const [event, setEvent] = useState(() => getInstallEvent());
  const [showIosHint] = useState(() => isIos());
  const [hidden, setHidden] = useState(() => wasDismissed() || alreadyInstalled());

  useEffect(() => {
    // האירוע עשוי להגיע גם אחרי שהרכיב נטען, ולכן נרשמים לעדכונים
    return onInstallChange(() => setEvent(getInstallEvent()));
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // אין אחסון — לפחות נעלם עד הרענון הבא
    }
    setHidden(true);
  };

  const install = async () => {
    await runInstallPrompt();
    dismiss();
  };

  if (hidden || (!event && !showIosHint)) return null;

  return (
    <div className="card install-card" style={{ margin: '14px 0 0' }}>
      <div className="row spread" style={{ alignItems: 'flex-start', gap: 10 }}>
        <div>
          <strong>📲 להוסיף את המשחק למסך הבית?</strong>
          <p className="dim" style={{ margin: '4px 0 0', fontSize: '0.86rem' }}>
            {event
              ? 'נפתח במסך מלא ועובד גם בלי אינטרנט.'
              : 'בספארי: לוחצים על כפתור השיתוף ⬆️ ואז על "הוספה למסך הבית".'}
          </p>
        </div>
        <button className="btn-small btn-ghost" aria-label="לא עכשיו" onClick={dismiss}>
          ✕
        </button>
      </div>

      {event && (
        <button className="btn-primary btn-small" style={{ marginTop: 10 }} onClick={() => void install()}>
          להוסיף למסך הבית
        </button>
      )}
    </div>
  );
}
