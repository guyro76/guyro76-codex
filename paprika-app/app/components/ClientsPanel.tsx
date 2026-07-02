'use client';

import { Plus, Users } from 'lucide-react';
import type { Client } from '../../lib/types';

const money = (value: number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(value);

export default function ClientsPanel({ clients, search, setSearch, openClient, removeClient }: {
  clients: Client[];
  search: string;
  setSearch: (value: string) => void;
  openClient: () => void;
  removeClient: (id: string) => void;
}) {
  return <div className="page-stack">
    <section className="page-hero"><div className="page-hero-icon"><Users/></div><div><h2>לקוחות 360°</h2><p>תיק לקוח מסחרי: מדיה, ריטיינר, יעדים, Health וביצועים.</p></div><div className="page-hero-action"><button className="btn primary" onClick={openClient}><Plus size={17}/>לקוח חדש</button></div></section>
    <div className="card toolbar-card"><input className="input search" placeholder="חיפוש לקוח, תחום או פלטפורמה" value={search} onChange={(event) => setSearch(event.target.value)}/></div>
    <div className="client-grid">{clients.map((client) => <article className="card client-product-card" key={client.id}>
      <div className="section-head"><div><span className={`status-chip status-${client.status}`}>{client.status}</span><h3>{client.name}</h3><p>{client.industry} · {client.platform}</p></div><div className="health-score">{client.health}</div></div>
      <div className="mini-grid"><Mini label="מדיה" value={money(client.monthly_budget)}/><Mini label="ריטיינר" value={money(client.monthly_fee)}/><Mini label="ROAS" value={client.roas.toFixed(1)}/><Mini label="CPA" value={money(client.cpa)}/></div>
      <div className="client-goal"><span>יעד ROAS</span><b>{client.target_roas.toFixed(1)}</b><span>לידים</span><b>{client.leads}</b></div>
      <div className="card-actions"><button className="btn secondary">פתיחת תיק</button><button className="btn danger" onClick={() => removeClient(client.id)}>מחיקה</button></div>
    </article>)}</div>
  </div>;
}

function Mini({ label, value }: { label: string; value: string }) { return <div className="mini"><span>{label}</span><b>{value}</b></div>; }
