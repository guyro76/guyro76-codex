'use client';

import { CircleDollarSign, Clock3, TrendingUp, WalletCards } from 'lucide-react';
import type { Client } from '../../lib/types';

const money = (value: number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(value);

export default function FinancePanel({ clients }: { clients: Client[] }) {
  const revenue = clients.reduce((sum, client) => sum + client.monthly_fee, 0);
  const media = clients.reduce((sum, client) => sum + client.monthly_budget, 0);
  const estimatedHours = clients.length * 18;
  const hourlyCost = 185;
  const grossProfit = revenue - estimatedHours * hourlyCost;
  const margin = revenue ? Math.round((grossProfit / revenue) * 100) : 0;
  return <div className="page-stack">
    <section className="page-hero"><div className="page-hero-icon"><WalletCards/></div><div><h2>רווחיות הסוכנות</h2><p>ריטיינרים, עלות שירות ורווח גולמי לפי לקוח.</p></div></section>
    <div className="grid metrics"><Metric icon={WalletCards} label="הכנסות" value={money(revenue)} note="ריטיינרים חודשיים"/><Metric icon={CircleDollarSign} label="מדיה מנוהלת" value={money(media)} note="לא הכנסה לסוכנות"/><Metric icon={Clock3} label="שעות שירות" value={String(estimatedHours)} note="אומדן חודשי"/><Metric icon={TrendingUp} label="רווח גולמי" value={money(grossProfit)} note={`${margin}% מרווח`}/></div>
    <div className="card table"><table><thead><tr><th>לקוח</th><th>ריטיינר</th><th>מדיה</th><th>שעות</th><th>עלות שירות</th><th>רווח גולמי</th></tr></thead><tbody>{clients.map((client) => { const hours = client.status === 'בסיכון' ? 24 : 18; const cost = hours * hourlyCost; const profit = client.monthly_fee - cost; return <tr key={client.id}><td><b>{client.name}</b></td><td>{money(client.monthly_fee)}</td><td>{money(client.monthly_budget)}</td><td>{hours}</td><td>{money(cost)}</td><td className={profit < 0 ? 'risk-text' : 'success-text'}>{money(profit)}</td></tr>; })}</tbody></table></div>
  </div>;
}

function Metric({ icon: Icon, label, value, note }: { icon: typeof WalletCards; label: string; value: string; note: string }) { return <article className="card metric commercial-card"><div className="metric-icon"><Icon size={20}/></div><span>{label}</span><strong>{value}</strong><small>{note}</small></article>; }
