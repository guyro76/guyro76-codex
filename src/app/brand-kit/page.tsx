"use client";

import { AppShell } from "@/components/AppShell";

const COLORS = [
  { name: "ראשי", hex: "#7DD3FC" },
  { name: "רקע", hex: "#06060B" },
  { name: "כרטיס", hex: "#0E0E16" },
  { name: "הדגשה", hex: "#34D399" },
];

const FONTS = [
  { name: "Rubik", role: "כותרות" },
  { name: "Heebo", role: "גוף טקסט" },
  { name: "Assistant", role: "כיתובים" },
];

const TONES = ["מקצועי", "אנושי", "ברור", "מעורר השראה"];

export default function BrandKitPage() {
  return (
    <AppShell>
      <section className="rounded-3xl border border-white/5 bg-[#0e0e16] p-6 md:p-8">
        <p className="text-sm font-bold uppercase tracking-wide text-sky-300">
          Brand Identity
        </p>
        <h1 className="mt-2 text-4xl font-black">Brand Kit 🎨</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          זהות מותג אחידה לכל התוכן: צבעים, טיפוגרפיה וטון דיבור עקבי בכל הערוצים.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Colors */}
        <div className="rounded-3xl border border-white/5 bg-[#0e0e16] p-6 text-right">
          <h2 className="text-xl font-black">פלטת צבעים</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {COLORS.map((c) => (
              <div key={c.name} className="flex items-center justify-end gap-3">
                <div>
                  <p className="text-sm font-bold">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.hex}</p>
                </div>
                <div
                  className="h-10 w-10 rounded-xl border border-white/10"
                  style={{ background: c.hex }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Fonts */}
        <div className="rounded-3xl border border-white/5 bg-[#0e0e16] p-6 text-right">
          <h2 className="text-xl font-black">טיפוגרפיה</h2>
          <div className="mt-4 flex flex-col gap-3">
            {FONTS.map((f) => (
              <div
                key={f.name}
                className="flex items-center justify-between rounded-2xl bg-[#06060b] p-4"
              >
                <span className="text-xs text-slate-500">{f.role}</span>
                <span className="text-lg font-black">{f.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tone */}
      <section className="rounded-3xl border border-white/5 bg-[#0e0e16] p-6 text-right">
        <h2 className="text-xl font-black">טון דיבור</h2>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {TONES.map((t) => (
            <span
              key={t}
              className="rounded-full bg-sky-300/10 px-4 py-2 text-sm font-bold text-sky-300"
            >
              {t}
            </span>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
