import { useRef, useState, type CSSProperties, type ReactNode, type SyntheticEvent } from 'react';
import Modal from './Modal';
import ParentGate from './ParentGate';

/**
 * קישור שיוצא מהמשחק — מאחורי שער הורים.
 *
 * ## למה
 *
 * שבעה קישורים במשחק מובילים לאתרים חיצוניים: קרדיט תמונה (דף הקובץ
 * בוויקישיתוף ונוסח הרישיון) בתוצאות, בפאזל ובמסך "מקורות וקרדיטים".
 * הרישיונות **מחייבים** אותם, ולכן אי אפשר להסיר. אבל ויקישיתוף הוא
 * אתר פתוח שבו ילד שלוחץ על "מקור" מגיע לדף שלא ביקרנו, ומשם לכל
 * מקום. מדיניות Google Play Families אוסרת קישור כזה בלי שער הורים,
 * ומדיניות הפרטיות הצהירה בכלל שאין במשחק קישורים לתוכן לא מבוקר.
 *
 * ## למה עוגן אמיתי ולא כפתור
 *
 * הקישור נשאר `<a href>`: קורא מסך מכריז אותו כקישור, וכתובת היעד
 * נמצאת ב-DOM כפי שהרישיון דורש. הלחיצה נעצרת, השער נפתח, ורק אחרי
 * שעברו אותו נשלחת לחיצה **אמיתית** על אותו עוגן — כך שההתנהגות
 * ב-WebView של אנדרואיד (פתיחה בדפדפן המערכת) זהה לקודמת בדיוק.
 *
 * ## מה זה לא
 *
 * זה מחסום מפני נגיעה מקרית, לא אבטחה: מי שיודע ללחוץ לחיצה ימנית
 * ולפתוח בלשונית חדשה יעקוף. השער נסגר מחדש בכל לחיצה.
 */
export default function GatedLink({
  href,
  children,
  className,
  style
}: {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const [asking, setAsking] = useState(false);
  const anchor = useRef<HTMLAnchorElement>(null);
  const passed = useRef(false);

  const intercept = (ev: SyntheticEvent) => {
    if (passed.current) return;
    ev.preventDefault();
    setAsking(true);
  };

  const onPass = () => {
    // הלחיצה האמיתית נשלחת מתוך אותה לחיצה של המשתמש על "ממשיכים",
    // ולכן דפדפנים לא חוסמים אותה כחלון קופץ
    passed.current = true;
    setAsking(false);
    anchor.current?.click();
    passed.current = false;
  };

  return (
    <>
      <a
        ref={anchor}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
        onClick={intercept}
        onAuxClick={intercept}
      >
        {children}
      </a>
      {asking && (
        <Modal onClose={() => setAsking(false)} label="שאלה להורים">
          <ParentGate purpose="external" onPass={onPass} onCancel={() => setAsking(false)} />
        </Modal>
      )}
    </>
  );
}
