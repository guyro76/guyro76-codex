import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { installAudioUnlock } from './lib/sound';
import './styles/global.css';

// אודיו באייפון: ה-AudioContext חייב להיווצר בתוך מחווה של המשתמש.
// המאזין הגלובלי דואג לזה כבר בנגיעה הראשונה במסך.
installAudioUnlock();

// עדכון גרסה: מציג הודעה ידידותית כשקיימת גרסה חדשה
const updateSW = registerSW({
  onNeedRefresh() {
    const el = document.createElement('div');
    el.setAttribute('role', 'alert');
    el.style.cssText =
      'position:fixed;bottom:12px;right:12px;left:12px;z-index:9999;background:#2d1c5e;color:#fff;' +
      'padding:14px;border-radius:14px;display:flex;gap:10px;align-items:center;justify-content:space-between;' +
      'box-shadow:0 10px 40px rgba(0,0,0,.5);direction:rtl;font-family:inherit';
    el.innerHTML = '<span>יש גרסה חדשה של המשחק! 🎉</span>';
    const btn = document.createElement('button');
    btn.textContent = 'עדכון';
    btn.style.cssText = 'background:#33d6c3;border:none;border-radius:10px;padding:8px 18px;font-weight:700;cursor:pointer';
    btn.onclick = () => updateSW(true);
    el.appendChild(btn);
    document.body.appendChild(el);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
