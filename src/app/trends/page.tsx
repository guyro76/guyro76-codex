"use client";

import { AppShell } from "@/components/AppShell";
import Link from "next/link";

const TRENDS = [
  { topic: "AI Agents בעסקים קטנים", momentum: 96, tag: "טכנולוגיה" },
  { topic: "בניית מותג אישי ב-LinkedIn", momentum: 91, tag: "קריירה" },
  { topic: "שיווק בוידאו קצר", momentum: 88, tag: "שיווק" },
  { topic: "פרודוקטיביות עם כלי AI", momentum: 85, tag: "פרודוקטיביות" },
  { topic: "סטוריטלינג לעסקים", momentum: 82, tag: "תוכן" },
  { topic: "אוטומציות ללא קוד", momentum: 79, tag: "טכנולוגיה" },
];

export default function TrendsPage() {
  return (
    <AppShell>
      <section className="rounded-3xl border edge surface p-6 md:p-8">
        <p className="text-sm font-bold uppercase tracking-wide accent-ink">
          Trend Radar
        </p>
        <h1 className="mt-2 text-4xl font-black">נושאים חמים 🔥</h1>
        <p className="mt-3 max-w-2xl ink-muted">
          טרנדים עולים בנישה שלך לפי מומנטום בזמן אמת. לחץ על נושא כדי להפוך אותו
          לקרוסלה.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        {TRENDS.map((t) => (
          <div
            key={t.topic}
            className="flex items-center justify-between rounded-3xl border edge surface p-5"
          >
            <Link
              href={`/content-factory?type=carousel`}
              className="rounded-2xl accent-surface px-4 py-2 text-sm font-bold transition-colors hover:accent-surface text-white"
            >
              צור תוכן
            </Link>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className="rounded-full surface-sunken px-2 py-0.5 text-xs ink-muted">
                  {t.tag}
                </span>
                <h3 className="text-lg font-black">{t.topic}</h3>
              </div>
              <div className="mt-2 flex items-center justify-end gap-2">
                <div className="h-2 w-40 overflow-hidden rounded-full surface-sunken">
                  <div
                    className="h-full rounded-full accent-surface text-white"
                    style={{ width: `${t.momentum}%` }}
                  />
                </div>
                <span className="text-xs font-bold accent-ink">
                  {t.momentum} מומנטום
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
