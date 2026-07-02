'use client';

import { Target } from 'lucide-react';
import type { Recommendation, RecommendationStatus } from '../../lib/types';

export default function RecommendationsPanel({ items, updateStatus }: { items: Recommendation[]; updateStatus: (id: string, status: RecommendationStatus) => void }) {
  return <div className="page-stack"><section className="page-hero"><div className="page-hero-icon"><Target/></div><div><h2>מרכז המלצות</h2><p>המלצות מבוססות נתונים עם אישור אנושי לפני ביצוע.</p></div></section><div className="recommendation-grid">{items.map((item) => <article className="card recommendation-card" key={item.id}><div className="section-head"><span className={`approval approval-${item.status}`}>{item.status}</span><b>{item.confidence}% ביטחון</b></div><h3>{item.title}</h3><p>{item.client_name} · {item.platform}</p><div className="evidence-box"><b>סיבה</b><p>{item.reason}</p></div><div className="action-box"><b>פעולה מוצעת</b><p>{item.action}</p></div><div className="practical"><b>השפעה צפויה</b><br/>{item.expected_impact}</div><details><summary>Rollback</summary><p>{item.rollback_plan}</p></details><div className="card-actions"><button className="btn approve" onClick={() => updateStatus(item.id, 'אושר')}>אישור</button><button className="btn reject" onClick={() => updateStatus(item.id, 'נדחה')}>דחייה</button><button className="btn secondary" onClick={() => updateStatus(item.id, 'בוצע')}>בוצע</button></div></article>)}</div></div>;
}
