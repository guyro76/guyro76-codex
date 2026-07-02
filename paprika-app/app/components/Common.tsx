import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export function PageHero({ title, text, icon: Icon, action }: { title: string; text: string; icon: LucideIcon; action?: ReactNode }) {
  return <section className="page-hero"><div className="page-hero-icon"><Icon/></div><div><h2>{title}</h2><p>{text}</p></div>{action && <div className="page-hero-action">{action}</div>}</section>;
}

export function Mini({ label, value }: { label: string; value: string }) {
  return <div className="mini"><span>{label}</span><b>{value}</b></div>;
}

export const money = (value: number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(value);
