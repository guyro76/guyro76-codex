'use client';

import { Download, FileText } from 'lucide-react';
import type { AgencyTask, Client, Recommendation } from '../../lib/types';

export default function ReportsPanel({ clients, tasks, recommendations, exportBackup }: { clients: Client[]; tasks: AgencyTask[]; recommendations: Recommendation[]; exportBackup: () => void }) {
  const open = tasks.filter((task) => task.status !== 'הושלם').length;
  const pending = recommendations.filter((item) => item.status === 'ממתין').length;
  const averageHealth = Math.round(clients.reduce((sum, client) => sum + client.health, 0) / Math.max(1, clients.length));
  return <div className="page-stack">
    <section className="page-hero"><div className="page-hero-icon"><FileText/></div><div><h2>דוחות מנהלים</h2><p>דוח סוכנות, דוח לקוח וייצוא נתונים.</p></div></section>
    <section className="card report-paper">
      <div className="report-brand"><div className="logo small"/><div><span>פפריקה PPC</span><h2>דוח מצב סוכנות</h2></div></div>
      <div className="grid report-metrics"><Mini label="לקוחות פעילים" value={String(clients.filter((client) => client.status === 'פעיל').length)}/><Mini label="משימות פתוחות" value={String(open)}/><Mini label="המלצות לאישור" value={String(pending)}/><Mini label="ממוצע Health" value={String(averageHealth)}/></div>
      <h3>לקוחות שדורשים תשומת לב</h3>{clients.filter((client) => client.health < 75).map((client) => <div className="report-row" key={client.id}><b>{client.name}</b><span>Health {client.health} · ROAS {client.roas} מול יעד {client.target_roas}</span></div>)}
    </section>
    <div className="toolbar"><button className="btn primary" onClick={() => window.print()}><FileText size={17}/>הדפסה / PDF</button><button className="btn secondary" onClick={exportBackup}><Download size={17}/>גיבוי JSON</button></div>
  </div>;
}

function Mini({ label, value }: { label: string; value: string }) { return <div className="mini"><span>{label}</span><b>{value}</b></div>; }
