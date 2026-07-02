'use client';

import { Activity, AlertTriangle, CircleDollarSign, Lightbulb, ListTodo, Plus, RefreshCcw, WalletCards } from 'lucide-react';
import type { ActivityItem, AgencyTask, AlertItem, Client } from '../../lib/types';
import { dailyTips } from '../../lib/product-data';

const money = (value: number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(value);

export default function DashboardPanel({ clients, tasks, alerts, activity, tipIndex, nextTip, openTask, openClient }: {
  clients: Client[];
  tasks: AgencyTask[];
  alerts: AlertItem[];
  activity: ActivityItem[];
  tipIndex: number;
  nextTip: () => void;
  openTask: () => void;
  openClient: () => void;
}) {
  const budget = clients.reduce((sum, client) => sum + client.monthly_budget, 0);
  const fees = clients.reduce((sum, client) => sum + client.monthly_fee, 0);
  const openTasks = tasks.filter((task) => task.status !== 'הושלם').length;
  const risk = clients.filter((client) => client.health < 70).length;
  return <div className="page-stack">
    <section className="hero commercial-hero">
      <div><span className="eyebrow">חדר מצב סוכנות</span><h3>בוקר טוב גיא, יש {openTasks} פעולות פתוחות</h3><p>בקרה אחת על לקוחות, רווחיות, תקציבים, התראות, משימות והמלצות קמפיינים.</p></div>
      <div className="hero-actions"><button className="btn light" onClick={openClient}><Plus size={17}/>לקוח חדש</button><button className="btn dark" onClick={openTask}><ListTodo size={17}/>משימה חדשה</button></div>
    </section>
    <div className="grid metrics commercial-metrics">
      <Metric icon={CircleDollarSign} label="מדיה מנוהלת" value={money(budget)} note="תקציב חודשי"/>
      <Metric icon={WalletCards} label="הכנסה חודשית" value={money(fees)} note="ריטיינרים"/>
      <Metric icon={ListTodo} label="משימות פתוחות" value={String(openTasks)} note="לביצוע ובטיפול"/>
      <Metric icon={AlertTriangle} label="לקוחות בסיכון" value={String(risk)} note="Health מתחת ל-70" warning={risk > 0}/>
    </div>
    <div className="grid dashboard-grid">
      <section className="card span-2"><div className="section-head"><div><h3>התראות שדורשות החלטה</h3><p>חריגות תקציב, מדידה וביצועים</p></div><span className="counter">{alerts.length}</span></div><div className="list">{alerts.map((alert) => <div className="alert-row" key={alert.id}><span className={`severity-dot severity-${alert.severity}`}/><div><b>{alert.title}</b><p>{alert.client_name} · {alert.details}</p></div><small>{alert.created_at}</small></div>)}</div></section>
      <section className="card tip-card"><span className="pill"><Lightbulb size={14}/>טיפ יומי</span><h3>{dailyTips[tipIndex][0]}</h3><p>{dailyTips[tipIndex][1]}</p><button className="btn primary" onClick={nextTip}><RefreshCcw size={16}/>טיפ נוסף</button></section>
      <section className="card span-2"><div className="section-head"><div><h3>בריאות תיק הלקוחות</h3><p>יעדים, ROAS ורווחיות</p></div></div><div className="client-health-list">{clients.map((client) => <div className="client-health" key={client.id}><div><b>{client.name}</b><small>{client.platform} · {client.status}</small></div><div><span>ROAS {client.roas.toFixed(1)} / יעד {client.target_roas.toFixed(1)}</span><div className="progress"><i style={{ width: `${Math.min(100, client.health)}%` }}/></div></div><strong className={client.health < 70 ? 'risk-text' : ''}>{client.health}</strong></div>)}</div></section>
      <section className="card"><div className="section-head"><div><h3>פעילות אחרונה</h3><p>Audit trail תפעולי</p></div><Activity size={19}/></div><div className="timeline">{activity.map((item) => <div key={item.id}><i/><p><b>{item.actor}</b> {item.action}<br/><span>{item.entity} · {item.created_at}</span></p></div>)}</div></section>
    </div>
  </div>;
}

function Metric({ icon: Icon, label, value, note, warning = false }: { icon: typeof AlertTriangle; label: string; value: string; note: string; warning?: boolean }) {
  return <article className={`card metric commercial-card ${warning ? 'metric-warning' : ''}`}><div className="metric-icon"><Icon size={20}/></div><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}
