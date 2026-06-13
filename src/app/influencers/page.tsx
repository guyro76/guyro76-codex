"use client";

import { AppShell } from "@/components/AppShell";

const INFLUENCERS = [
  { name: "דנה לוי", field: "שיווק דיגיטלי", followers: "128K", platform: "LinkedIn", match: 95 },
  { name: "יואב כהן", field: "יזמות וטכנולוגיה", followers: "89K", platform: "Instagram", match: 92 },
  { name: "מאיה ברק", field: "מותג אישי", followers: "210K", platform: "TikTok", match: 88 },
  { name: "אורי שמש", field: "פרודוקטיביות", followers: "64K", platform: "LinkedIn", match: 84 },
  { name: "נועה גל", field: "תוכן ויראלי", followers: "305K", platform: "Instagram", match: 81 },
  { name: "תום אבני", field: "AI וחדשנות", followers: "47K", platform: "TikTok", match: 79 },
];

export default function InfluencersPage() {
  return (
    <AppShell>
      <section className="rounded-3xl border border-white/5 bg-[#0e0e16] p-6 md:p-8">
        <p className="text-sm font-bold uppercase tracking-wide text-sky-300">
          Network Map
        </p>
        <h1 className="mt-2 text-4xl font-black">אושיות רשת 👥</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          אושיות מפתח בנישה שלך שכדאי להגיב להן ולבנות איתן קשר. ההתאמה מחושבת לפי
          חפיפת קהל ונושאים.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {INFLUENCERS.map((p) => (
          <div
            key={p.name}
            className="rounded-3xl border border-white/5 bg-[#0e0e16] p-6 text-right"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-sky-300/10 px-3 py-1 text-xs font-bold text-sky-300">
                {p.match}% התאמה
              </span>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#06060b] text-lg font-black text-sky-300">
                {p.name.charAt(0)}
              </div>
            </div>
            <h3 className="mt-4 text-lg font-black">{p.name}</h3>
            <p className="text-sm text-slate-400">{p.field}</p>
            <div className="mt-3 flex items-center justify-end gap-3 text-xs text-slate-500">
              <span>{p.platform}</span>
              <span>•</span>
              <span>{p.followers} עוקבים</span>
            </div>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
