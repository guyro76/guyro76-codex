'use client';

import { Zap } from 'lucide-react';
import type { IntegrationState } from '../../lib/types';

export default function SettingsPanel({ integrations }: { integrations: IntegrationState[] }) {
  return <div className="page-stack"><section className="page-hero"><div className="page-hero-icon"><Zap/></div><div><h2>חיבורים והגדרות</h2><p>מצב שירותי הענן והאינטגרציות של פפריקה.</p></div></section><div className="integration-grid">{integrations.map((item) => <article className="card integration-card" key={item.id}><div className="integration-icon">{item.name.slice(0, 1)}</div><div><div className="section-head"><h3>{item.name}</h3><span className={`connection connection-${item.status}`}>{labels[item.status]}</span></div><p>{item.details}</p>{item.last_sync && <small>סנכרון אחרון: {item.last_sync}</small>}</div></article>)}</div><div className="grid two"><section className="card"><h3>הרשאות וצוות</h3><ul className="feature-list"><li>תפקידי Owner, Admin, Manager, Analyst ו-Client</li><li>הפרדה בין סוכנויות ולקוחות</li><li>יומן פעולות מלא</li></ul></section><section className="card"><h3>מוכנות מסחרית</h3><ul className="feature-list"><li>סביבת Trial</li><li>תוכניות מנוי</li><li>Onboarding ללקוח ולצוות</li><li>דוחות ממותגים</li></ul></section></div></div>;
}

const labels = { connected: 'מחובר', pending: 'ממתין', error: 'שגיאה', disconnected: 'מנותק' } as const;
