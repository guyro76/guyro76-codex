import { useEffect, useState } from 'react';
import SkinPicker from '../components/SkinPicker';
import { DEFAULT_SKIN } from '../data/skins';
import TopBar from '../components/TopBar';
import { useApp } from '../store/appStore';
import { db, getSetting, setSetting, importProfile } from '../db/db';
import { applyContentPack, fetchContentPack } from '../lib/contentPack';
import { iosSilentSwitchLikely, primeAudio, setSoundEnabled, sfx } from '../lib/sound';
import { canSpeak, readAloudOn, setReadAloud, speak } from '../lib/speak';

export default function Settings() {
  const { loadProfiles, navigate } = useApp();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [skin, setSkin] = useState<string | undefined>(undefined);
  const [bigText, setBigText] = useState(false);
  const [sound, setSound] = useState(true);
  const [miniGames, setMiniGames] = useState(true);
  const [aloud, setAloud] = useState(readAloudOn());
  const [storageUse, setStorageUse] = useState<string>('...');
  const [packVersion, setPackVersion] = useState<string | null>(null);
  const [packCount, setPackCount] = useState(0);
  const [packAuto, setPackAuto] = useState(true);
  const [packMsg, setPackMsg] = useState('');
  const [packBusy, setPackBusy] = useState(false);

  useEffect(() => {
    void getSetting('skin').then((v) => setSkin(v ?? DEFAULT_SKIN));
    void getSetting('reducedMotion').then((v) => setReducedMotion(v === '1'));
    void getSetting('bigText').then((v) => setBigText(v === '1'));
    void getSetting('sound').then((v) => setSound(v !== '0'));
    void getSetting('miniGames').then((v) => setMiniGames(v !== '0'));
    void getSetting('read-aloud').then((v) => setAloud(v === '1'));
    void getSetting('contentPackVersion').then((v) => setPackVersion(v ?? null));
    void getSetting('packAutoUpdate').then((v) => setPackAuto(v !== '0'));
    void db.contentItems.count().then(setPackCount);
    if (navigator.storage?.estimate) {
      void navigator.storage.estimate().then((est) => {
        setStorageUse(`${((est.usage ?? 0) / 1024 / 1024).toFixed(1)} MB`);
      });
    } else {
      setStorageUse('לא זמין');
    }
  }, []);

  const toggle = async (key: string, value: boolean, cssClass?: string) => {
    await setSetting(key, value ? '1' : '0');
    if (cssClass) document.body.classList.toggle(cssClass, value);
  };

  const clearImageCache = async () => {
    // גם קובצי התמונות עצמם (Cache API) וגם רשימת הכתובות ששמורה מקומית
    if ('caches' in window) {
      await caches.delete('wikimedia-images');
      await caches.delete('wiki-api');
    }
    await db.imageCache.clear();
    setStorageUse('נוקה ✔');
  };

  return (
    <div className="screen">
      <TopBar title="⚙️ הגדרות" />

      <div className="card" style={{ marginBottom: 14 }}>
        <strong>🎨 ערכת צבעים</strong>
        <p className="dim" style={{ margin: '4px 0 12px', fontSize: '0.88rem' }}>
          בוחרים איך המשחק ייראה. ההחלפה מיידית, וכל ערכה נבדקה שהטקסט בה נקרא היטב.
        </p>
        <SkinPicker current={skin} />
      </div>

      <div className="card grid" style={{ gap: 14 }}>
        <label className="row spread">
          <span>🔇 הפחתת תנועה ואנימציות</span>
          <input
            type="checkbox"
            style={{ width: 28, minHeight: 28 }}
            checked={reducedMotion}
            onChange={(ev) => {
              setReducedMotion(ev.target.checked);
              void toggle('reducedMotion', ev.target.checked, 'reduced-motion');
            }}
          />
        </label>
        <label className="row spread">
          <span>🔤 טקסט מוגדל</span>
          <input
            type="checkbox"
            style={{ width: 28, minHeight: 28 }}
            checked={bigText}
            onChange={(ev) => {
              setBigText(ev.target.checked);
              void toggle('bigText', ev.target.checked, 'big-text');
            }}
          />
        </label>
        <label className="row spread">
          <span>🔊 צלילים ורטט</span>
          <input
            type="checkbox"
            style={{ width: 28, minHeight: 28 }}
            checked={sound}
            onChange={(ev) => {
              setSound(ev.target.checked);
              setSoundEnabled(ev.target.checked);
              void setSetting('sound', ev.target.checked ? '1' : '0');
            }}
          />
        </label>
        {canSpeak() && (
          <label className="row spread">
            <span>
              🗣️ הקראה בקול
              <span className="dim" style={{ display: 'block', fontSize: '0.8rem' }}>
                לילדים שעדיין לא קוראים — הקטגוריה והאות נאמרות בקול.
                תשובות שהילד כותב לא מוקראות אף פעם.
              </span>
            </span>
            <input
              type="checkbox"
              style={{ width: 28, minHeight: 28 }}
              checked={aloud}
              onChange={(ev) => {
                const next = ev.target.checked;
                setAloud(next);
                setReadAloud(next);
                void setSetting('read-aloud', next ? '1' : '0');
                // דוגמית מיד, מתוך המחווה עצמה — כך ההורה שומע אם
                // יש בכלל קול עברי במכשיר ולא מגלה את זה באמצע משחק
                if (next) speak('שלום! עכשיו אני מקריא לך.');
              }}
            />
          </label>
        )}
        <label className="row spread">
          <span>🎲 משימות ביניים בין סיבובים</span>
          <input
            type="checkbox"
            style={{ width: 28, minHeight: 28 }}
            checked={miniGames}
            onChange={(ev) => {
              setMiniGames(ev.target.checked);
              void setSetting('miniGames', ev.target.checked ? '1' : '0');
            }}
          />
        </label>
        {sound && (
          <div style={{ marginTop: 8 }}>
            <button
              className="btn-small"
              onClick={() => {
                // הלחיצה עצמה משחררת את האודיו באייפון, ואז מנגנת
                primeAudio();
                sfx.win();
              }}
            >
              🎵 בדיקת צליל
            </button>
            {iosSilentSwitchLikely() && (
              <p className="dim" style={{ fontSize: '0.8rem', margin: '6px 0 0' }}>
                לא שומעים כלום באייפון? ודאו שמתג ה<strong>שקט</strong> בצד המכשיר כבוי ושעוצמת
                הקול מוגברת. הצליל נדלק מעצמו מיד אחרי הנגיעה הראשונה במסך.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <strong>💾 אחסון</strong>
        <p className="dim">המשחק תופס כרגע: {storageUse}</p>
        <button className="btn-small" onClick={() => void clearImageCache()}>
          🧹 ניקוי מטמון תמונות
        </button>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <strong>🔄 עדכוני תוכן</strong>
        <p className="dim" style={{ fontSize: '0.88rem' }}>
          {packVersion
            ? `חבילה מותקנת: ${packVersion} · ${packCount} ערכים נוספים במאגר`
            : 'אין חבילת תוכן מותקנת — המשחק משתמש במאגר המובנה (עובד מצוין גם כך)'}
        </p>
        <label className="row spread">
          <span>עדכון אוטומטי (לכל היותר פעם ביום)</span>
          <input
            type="checkbox"
            style={{ width: 28, minHeight: 28 }}
            checked={packAuto}
            onChange={(ev) => {
              setPackAuto(ev.target.checked);
              void setSetting('packAutoUpdate', ev.target.checked ? '1' : '0');
            }}
          />
        </label>
        <button
          className="btn-small"
          disabled={packBusy || !navigator.onLine}
          onClick={() => {
            setPackBusy(true);
            setPackMsg('בודקים…');
            void fetchContentPack()
              .then(applyContentPack)
              .then(async (r) => {
                setPackVersion(r.version);
                setPackCount(await db.contentItems.count());
                setPackMsg(`עודכן לגרסה ${r.version} — נוספו ${r.added} ערכים 🎉`);
              })
              .catch((err: Error) => setPackMsg(`אין עדכון זמין (${err.message})`))
              .finally(() => setPackBusy(false));
          }}
        >
          {navigator.onLine ? '⬇️ בדיקת עדכון עכשיו' : '📴 נדרש חיבור לאינטרנט'}
        </button>
        {packMsg && <p className="dim" style={{ fontSize: '0.85rem' }}>{packMsg}</p>}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <strong>📥 ייבוא פרופיל מקובץ</strong>
        <p className="dim" style={{ fontSize: '0.88rem' }}>
          שחזור פרופיל שיוצא בעבר ממכשיר אחר (קובץ JSON)
        </p>
        <input
          type="file"
          accept="application/json"
          aria-label="בחירת קובץ פרופיל"
          onChange={(ev) => {
            const file = ev.target.files?.[0];
            if (!file) return;
            void file.text().then(async (text) => {
              try {
                await importProfile(text);
                await loadProfiles();
                alert('הפרופיל יובא בהצלחה! 🎉');
              } catch {
                alert('הקובץ אינו קובץ פרופיל תקין');
              }
            });
          }}
        />
      </div>

      <div className="row" style={{ marginTop: 14 }}>
        {/* המחירים נגישים גם בלי חשבון: הורה שוקל לקנות *לפני* שהוא
            נרשם, ומסך שמוסתר מאחורי הרשמה פשוט לא נקרא. */}
        <button onClick={() => navigate('pricing')}>💎 החבילות והמחירים</button>
        <button onClick={() => navigate('privacy')}>🔐 פרטיות ומחיקת מידע</button>
        <button onClick={() => navigate('credits')}>📜 מקורות וקרדיטים</button>
        <button onClick={() => navigate('parent')}>🔒 מצב הורה</button>
      </div>
    </div>
  );
}
