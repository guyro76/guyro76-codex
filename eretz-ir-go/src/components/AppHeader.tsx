import { useEffect, useState } from 'react';
import { useApp } from '../store/appStore';
import { useAuth } from '../store/authStore';
import { identityFrom } from '../lib/identity';
import Avatar from './Avatar';
import Modal from './Modal';
import { getAudioMode, onAudioModeChange, setAudioMode, sfx, type AudioMode } from '../lib/sound';
import { setSetting } from '../db/db';

/**
 * הכותרת הקבועה של המשחק.
 *
 * מימין הזהות — התמונה והשם המלא של המשתמש המחובר, כך שברור בכל
 * רגע לאיזה חשבון נכנסת. משמאל שני מוצאים שחייבים להיות זמינים מכל
 * מסך: חזרה לדף הבית ויציאה מהחשבון.
 *
 * שתי החלטות שנראות קטנות ואינן:
 * 1. **כפתור הבית מוסתר בדף הבית עצמו**, וגם לפני שנבחר שחקן.
 *    לפני בחירת פרופיל מסך הבית מחזיר מיד למסך הפרופילים, כך
 *    שהכפתור היה נראה כאילו הוא לא עובד.
 * 2. **היציאה מבקשת אישור.** ילד באמצע משחק שילחץ בטעות על יציאה
 *    יאבד את הסיבוב ויצטרך להתחבר מחדש — מחיר גבוה מדי ללחיצה אחת.
 */
export default function AppHeader() {
  const { screen, navigate, activeProfile } = useApp();
  const session = useAuth((s) => s.session);
  const signOut = useAuth((s) => s.signOut);
  const [confirming, setConfirming] = useState(false);

  // מצב האודיו נשלט מכל מסך, כי הרצון להשתיק מגיע בדיוק כשהצליל מפריע
  const [audio, setAudio] = useState<AudioMode>(() => getAudioMode());
  useEffect(() => onAudioModeChange(setAudio), []);

  const AUDIO_NEXT: Record<AudioMode, AudioMode> = { all: 'sfx', sfx: 'none', none: 'all' };
  const AUDIO_ICON: Record<AudioMode, string> = { all: '🔊', sfx: '🔉', none: '🔇' };
  const AUDIO_LABEL: Record<AudioMode, string> = {
    all: 'מוזיקה וצלילים פועלים — ללחוץ כדי לכבות מוזיקה',
    sfx: 'צלילים בלבד — ללחוץ כדי להשתיק הכול',
    none: 'הכול מושתק — ללחוץ כדי להפעיל'
  };

  const cycleAudio = () => {
    const next = AUDIO_NEXT[audio];
    setAudioMode(next);
    void setSetting('audio-mode', next);
    if (next !== 'none') sfx.tick();
  };

  const identity = identityFrom(session);
  // במסכים שלפני בחירת שחקן אין לאן לחזור, ולכן אין כפתור בית
  const showHome = !!activeProfile && screen !== 'home';

  // הכותרת מוצגת תמיד — כפתור ההשתקה צריך להיות זמין בכל מסך,
  // כולל לפני התחברות ובאמצע סיבוב.
  return (
    <>
      <header className="app-header">
        <div className="app-header-identity">
          {identity && (
            <>
              <Avatar
                avatar={activeProfile?.avatar ?? '🙂'}
                name={identity.fullName}
                size={32}
              />
              <span className="app-header-name" title={identity.email ?? undefined}>
                {identity.fullName}
              </span>
            </>
          )}
        </div>

        <div className="app-header-actions">
          <button className="btn-small btn-ghost" aria-label={AUDIO_LABEL[audio]} title={AUDIO_LABEL[audio]} onClick={cycleAudio}>
            {AUDIO_ICON[audio]}
          </button>
          {showHome && (
            <button className="btn-small btn-ghost" aria-label="לדף הבית" onClick={() => navigate('home')}>
              🏠
            </button>
          )}
          {identity && (
            <button className="btn-small btn-ghost" aria-label="יציאה מהחשבון" onClick={() => setConfirming(true)}>
              🚪
            </button>
          )}
        </div>
      </header>

      {confirming && (
        <Modal onClose={() => setConfirming(false)}>
          <div className="center">
            <h2 style={{ marginTop: 0 }}>לצאת מהחשבון?</h2>
            <p className="dim">
              המילים, התוצאות והפרופילים נשארים שמורים במכשיר. תמיד אפשר להתחבר שוב.
            </p>
            <div className="row" style={{ justifyContent: 'center' }}>
              <button className="btn-primary" onClick={() => setConfirming(false)}>
                נשארים
              </button>
              <button onClick={() => void signOut()}>יציאה</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
