import { useEffect, useState } from 'react';
import { setAnnouncer } from '../lib/announce';

/**
 * אזור ההכרזות של האפליקציה — בלתי נראה בעין, אבל קוראי מסך מקריאים
 * כל טקסט שמגיע אליו.
 *
 * `polite` ולא `assertive` בכוונה: ההכרזה מחכה לרגע שקט במקום לקטוע
 * את הילד באמצע הקראה של משהו אחר.
 *
 * שתי הודעות זהות ברצף (למשל אותה אות שנשלפת פעמיים) לא היו מוקראות
 * שוב, כי ה-DOM לא משתנה — לכן נשמר גם מונה שמכריח שינוי.
 */
export default function LiveRegion() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    let tick = 0;
    setAnnouncer((text) => {
      tick += 1;
      // התו הבלתי נראה משתנה בין הודעות ומבטיח שהדפדפן יזהה שינוי
      setMessage(tick % 2 === 0 ? text : `${text}‎`);
    });
    return () => setAnnouncer(null);
  }, []);

  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  );
}
