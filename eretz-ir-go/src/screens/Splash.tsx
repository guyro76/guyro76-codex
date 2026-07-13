import { useEffect, useState } from 'react';
import { useApp } from '../store/appStore';
import { tipOfTheDay } from '../data/tips';
import { todayKey } from '../lib/daily';

export default function Splash() {
  const navigate = useApp((s) => s.navigate);
  const [installEvent, setInstallEvent] = useState<Event | null>(null);

  useEffect(() => {
    const handler = (ev: Event) => {
      ev.preventDefault();
      setInstallEvent(ev);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  return (
    <div className="screen center" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: '4.5rem' }} aria-hidden>
        🌍🏙️
      </div>
      <h1 style={{ fontSize: '2.6rem', background: 'linear-gradient(90deg,#33d6c3,#7c5cff,#ff5c8a)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
        ארץ-עיר GO!
      </h1>
      <p className="dim">המשחק הקלאסי — בגרסה חכמה, מהירה וכיפית. עובד גם בלי אינטרנט!</p>

      <div className="card" style={{ margin: '18px auto', maxWidth: 420 }}>
        <strong>💡 טיפ יומי:</strong> {tipOfTheDay(todayKey())}
      </div>

      <button className="btn-primary" style={{ fontSize: '1.3rem', padding: '14px 44px' }} onClick={() => navigate('profiles')}>
        בואו נשחק! 🚀
      </button>

      {installEvent && (
        <button
          className="btn-ghost"
          style={{ marginTop: 14 }}
          onClick={() => {
            (installEvent as Event & { prompt: () => void }).prompt();
            setInstallEvent(null);
          }}
        >
          📲 התקנת המשחק במסך הבית
        </button>
      )}
    </div>
  );
}
