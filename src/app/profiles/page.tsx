"use client";

import { AppShell } from "@/components/AppShell";

const PROFILES = [
  { platform: "LinkedIn", handle: "@guy.rosenberg", score: 92, status: "מחובר" },
  { platform: "Instagram", handle: "@guyro76", score: 84, status: "מחובר" },
  { platform: "Facebook", handle: "Guy Rosenberg", score: 81, status: "מחובר" },
  { platform: "TikTok", handle: "@guyro", score: 78, status: "מחובר" },
];

const SIGNALS = [
  { label: "עקביות פרסום", value: "טובה", desc: "4.2 פוסטים בשבוע בממוצע" },
  { label: "טון אחיד", value: "גבוהה", desc: "זהות מותג עקבית בכל הערוצים" },
  { label: "מילות מפתח", value: "בינונית", desc: "כדאי למקד 3 נושאי ליבה" },
];

export default function ProfilesPage() {
  return (
    <AppShell>
      <section className="rounded-3xl border border-white/5 bg-[#0e0e16] p-6 md:p-8">
        <p className="text-sm font-bold uppercase tracking-wide text-sky-300">
          Profile Intelligence
        </p>
        <h1 className="mt-2 text-4xl font-black">ניתוח פרופילים</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          המערכת סורקת את כל הפרופילים המחוברים, מודדת עקביות, טון וזהות מותג,
          וממירה אותם להמלצות פעולה.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PROFILES.map((p) => (
          <div
            key={p.platform}
            className="flex items-center justify-between rounded-3xl border border-white/5 bg-[#0e0e16] p-6"
          >
            <span className="rounded-full bg-[#06060b] px-3 py-1 text-sm font-bold text-sky-300">
              {p.score}/100
            </span>
            <div className="text-right">
              <h3 className="text-xl font-black">{p.platform}</h3>
              <p className="text-sm text-slate-400">{p.handle}</p>
              <p className="mt-1 text-xs text-emerald-400">● {p.status}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {SIGNALS.map((s) => (
          <div
            key={s.label}
            className="rounded-3xl border border-white/5 bg-[#0e0e16] p-6 text-right"
          >
            <p className="text-sm text-slate-400">{s.label}</p>
            <p className="mt-1 text-2xl font-black text-sky-300">{s.value}</p>
            <p className="mt-2 text-sm text-slate-400">{s.desc}</p>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
