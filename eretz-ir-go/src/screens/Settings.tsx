import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { useApp } from '../store/appStore';
import { getSetting, setSetting, importProfile } from '../db/db';

export default function Settings() {
  const { loadProfiles, navigate } = useApp();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [bigText, setBigText] = useState(false);
  const [sound, setSound] = useState(true);
  const [storageUse, setStorageUse] = useState<string>('...');

  useEffect(() => {
    void getSetting('reducedMotion').then((v) => setReducedMotion(v === '1'));
    void getSetting('bigText').then((v) => setBigText(v === '1'));
    void getSetting('sound').then((v) => setSound(v !== '0'));
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
    if ('caches' in window) {
      await caches.delete('wikimedia-images');
      await caches.delete('wiki-api');
      setStorageUse('נוקה ✔');
    }
  };

  return (
    <div className="screen">
      <TopBar title="⚙️ הגדרות" />

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
              void setSetting('sound', ev.target.checked ? '1' : '0');
            }}
          />
        </label>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <strong>💾 אחסון</strong>
        <p className="dim">המשחק תופס כרגע: {storageUse}</p>
        <button className="btn-small" onClick={() => void clearImageCache()}>
          🧹 ניקוי מטמון תמונות
        </button>
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
        <button onClick={() => navigate('privacy')}>🔐 פרטיות ומחיקת מידע</button>
        <button onClick={() => navigate('credits')}>📜 מקורות וקרדיטים</button>
        <button onClick={() => navigate('parent')}>🔒 מצב הורה</button>
      </div>
    </div>
  );
}
