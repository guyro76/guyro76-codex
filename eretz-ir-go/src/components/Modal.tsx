import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * חלון מודאלי.
 *
 * מוצג דרך Portal ישירות על `document.body`: כשהחלון נפתח מתוך כרטיס
 * קטגוריה, ההורה שלו יוצר הקשר ערימה משלו (position/animation/transform)
 * והחלון היה נלכד מתחת לכרטיסים השכנים — כך ש"סגירה" הפכה לבלתי לחיצה.
 * Portal מוציא אותו מכל ההיררכיה הזו.
 *
 * ## נגישות — מה שחסר היה כל מה ש-axe לא רואה
 *
 * הגרסה הקודמת הציגה את החלון ו**זהו**. `aria-modal="true"` הוא הבטחה
 * לקורא המסך שהדף שמאחור אינו זמין, אבל שום דבר לא עמד מאחוריה:
 *
 *  1. הפוקוס נשאר על הכפתור שפתח את החלון, **מאחורי** הרקע. קורא מסך
 *     לא הכריז שנפתח חלון, ומשתמש מקלדת המשיך ללחוץ Tab בתוך הדף
 *     שנסתר.
 *  2. אין לכידת פוקוס: Tab יצא מהחלון אל הדף.
 *  3. בסגירה הפוקוס לא חזר — הוא נעלם, והמשתמש התחיל את הדף מההתחלה.
 *  4. ל-`role="dialog"` לא היה שם נגיש.
 *  5. Escape סגר **את כל** החלונות הפתוחים יחד, כי כל חלון הוסיף
 *     מאזין משלו.
 *
 * axe לא תפס כלום מזה, כי בדיקות הנגישות סורקות מסכים ולא חלונות
 * פתוחים. קריטריונים 2.4.3 (סדר פוקוס) ו-4.1.2 (שם ותפקיד) נכשלים בלי
 * שום התראה — ולכן הם נבדקים עכשיו ב-`e2e/modalA11y.spec.ts`.
 */

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

/** חלונות פתוחים לפי סדר הפתיחה. רק העליון מגיב ל-Escape ול-Tab. */
const openModals: symbol[] = [];

function focusableIn(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
  );
}

export default function Modal({
  children,
  onClose,
  label
}: {
  children: ReactNode;
  onClose?: () => void;
  /** שם נגיש כשאין כותרת בתוך החלון. עם כותרת (h1-h3) היא משמשת כשם. */
  label?: string;
}) {
  const [host] = useState(() => (typeof document === 'undefined' ? null : document.createElement('div')));
  const dialogRef = useRef<HTMLDivElement>(null);
  const idPrefix = useId();

  /*
    `onClose` נשמר ב-ref ולא נכנס לתלויות האפקט. הורים מעבירים לרוב
    חץ חדש בכל רינדור, ואם האפקט היה תלוי בו הוא היה נסגר ונפתח מחדש
    על כל הקלדה — כולל הסרת החלון מה-DOM, ואיתה הפוקוס.
  */
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!host) return;
    const me = Symbol('modal');
    openModals.push(me);
    const isTop = () => openModals[openModals.length - 1] === me;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.appendChild(host);

    // נעילת גלילת הרקע כל עוד החלון פתוח
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const dialog = dialogRef.current;

    // שם נגיש: הכותרת הראשונה בחלון, ואם אין — התווית שהועברה
    if (dialog) {
      const heading = dialog.querySelector<HTMLElement>('h1, h2, h3');
      if (heading) {
        heading.id ||= `${idPrefix}-title`;
        dialog.setAttribute('aria-labelledby', heading.id);
      } else {
        dialog.setAttribute('aria-label', label ?? 'חלון');
      }

      // פוקוס פנימה. שדה שסומן data-autofocus (למשל תשובה לשער הורים)
      // מקבל אותו ישירות; אחרת החלון עצמו, כדי שקורא מסך יכריז את שמו
      // ושלחיצת Enter לא תפעיל בטעות כפתור הרסני שהוא הראשון בחלון.
      (dialog.querySelector<HTMLElement>('[data-autofocus]') ?? dialog).focus();
    }

    const onKey = (ev: KeyboardEvent) => {
      if (!isTop()) return;
      if (ev.key === 'Escape') {
        onCloseRef.current?.();
        return;
      }
      if (ev.key !== 'Tab' || !dialog) return;

      // לכידת פוקוס: Tab מהאחרון חוזר לראשון, ו-Shift+Tab להפך
      const items = focusableIn(dialog);
      if (items.length === 0) {
        ev.preventDefault();
        dialog.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (ev.shiftKey && (active === first || active === dialog)) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && active === last) {
        ev.preventDefault();
        first.focus();
      }
    };

    // רשת ביטחון: אם הפוקוס בכל זאת הגיע לדף שמאחור (לחיצה על הרקע,
    // טכנולוגיה מסייעת) — מחזירים אותו פנימה
    const onFocusIn = (ev: FocusEvent) => {
      if (!isTop() || !dialog) return;
      if (ev.target instanceof Node && !dialog.contains(ev.target) && !host.contains(ev.target)) {
        (focusableIn(dialog)[0] ?? dialog).focus();
      }
    };

    window.addEventListener('keydown', onKey);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('focusin', onFocusIn);
      const at = openModals.indexOf(me);
      if (at >= 0) openModals.splice(at, 1);
      document.body.style.overflow = previousOverflow;
      host.remove();
      // הפוקוס חוזר למי שפתח את החלון — אם הוא עדיין קיים
      if (opener?.isConnected) opener.focus();
    };
  }, [host, idPrefix, label]);

  if (!host) return null;

  return createPortal(
    <div className="modal-backdrop" onClick={() => onCloseRef.current?.()} role="presentation">
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onClick={(ev) => ev.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    host
  );
}
