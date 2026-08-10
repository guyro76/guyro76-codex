import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * חלון מודאלי.
 *
 * מוצג דרך Portal ישירות על `document.body`: כשהחלון נפתח מתוך כרטיס
 * קטגוריה, ההורה שלו יוצר הקשר ערימה משלו (position/animation/transform)
 * והחלון היה נלכד מתחת לכרטיסים השכנים — כך ש"סגירה" הפכה לבלתי לחיצה.
 * Portal מוציא אותו מכל ההיררכיה הזו.
 */
export default function Modal({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  const [host] = useState(() => (typeof document === 'undefined' ? null : document.createElement('div')));

  useEffect(() => {
    if (!host) return;
    document.body.appendChild(host);
    // נעילת גלילת הרקע כל עוד החלון פתוח
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (ev: KeyboardEvent) => ev.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
      host.remove();
    };
  }, [host, onClose]);

  if (!host) return null;

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(ev) => ev.stopPropagation()}>
        {children}
      </div>
    </div>,
    host
  );
}
