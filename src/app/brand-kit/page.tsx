"use client";

import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getBrand, saveBrand, type Brand } from "@/lib/brand-store";
import { Icon } from "@/components/Icons";

const TONES = ["מקצועי", "אנושי", "ברור", "מעורר השראה", "נועז", "ידידותי"];
const OBJECTIVES = [
  "בניית סמכות",
  "הגדלת מעורבות",
  "הגדלת עוקבים",
  "יצירת לידים",
];
const COLOR_LABELS = ["צבע ראשי", "צבע משני", "צבע הדגשה"];

export default function BrandKitPage() {
  const [brand, setBrand] = useState<Brand | null>(null);

  useEffect(() => {
    setBrand(getBrand());
  }, []);

  if (!brand) {
    return (
      <AppShell>
        <div className="glass rounded-3xl p-10 text-center text-cyan-300/70 animate-pulse">
          טוען...
        </div>
      </AppShell>
    );
  }

  const update = (patch: Partial<Brand>) =>
    setBrand((b) => (b ? { ...b, ...patch } : b));

  const updateColor = (i: number, hex: string) => {
    const colors = [...brand.colors];
    colors[i] = hex;
    update({ colors });
  };

  const handleSave = () => {
    saveBrand(brand);
    toast.success("זהות המותג נשמרה — תוזן אוטומטית בכל יצירת תוכן ✨");
  };

  return (
    <AppShell>
      <section className="glass-strong rounded-3xl p-6 md:p-8 border border-magenta-500/30">
        <div className="flex items-start justify-between gap-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-2xl border border-cyan-500/50 bg-gradient-to-r from-cyan-900/40 to-magenta-900/40 px-5 py-2.5 text-sm font-bold neon-cyan transition-all hover:shadow-lg"
          >
            <Icon name="sparkles" size={16} />
            שמור זהות
          </button>
          <div className="text-right">
            <p className="text-sm font-bold uppercase tracking-wide neon-cyan neon-glow">
              🎨 BRAND IDENTITY
            </p>
            <h1 className="mt-2 text-4xl font-black text-gradient">Brand Kit</h1>
            <p className="mt-2 max-w-2xl text-cyan-200/80 text-sm">
              הגדר את זהות המותג שלך פעם אחת — קהל, טון, מטרה וצבעים. המערכת תשתמש
              בה כברירת מחדל בכל תוכן שתיצור.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Identity */}
        <div className="glass rounded-3xl p-6 text-right border border-cyan-500/20">
          <h2 className="text-xl font-black text-cyan-100">פרטי מותג</h2>
          <div className="mt-4 flex flex-col gap-4">
            <label className="block">
              <span className="text-sm text-cyan-300/70">שם המותג</span>
              <input
                value={brand.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="לדוגמה: Postwave"
                className="mt-1 w-full rounded-xl border border-cyan-500/30 bg-black/40 px-4 py-2.5 text-right text-cyan-100 placeholder-cyan-300/30 focus:border-magenta-500/60 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm text-cyan-300/70">קהל יעד</span>
              <input
                value={brand.audience}
                onChange={(e) => update({ audience: e.target.value })}
                placeholder="לדוגמה: בעלי עסקים קטנים"
                className="mt-1 w-full rounded-xl border border-cyan-500/30 bg-black/40 px-4 py-2.5 text-right text-cyan-100 placeholder-cyan-300/30 focus:border-magenta-500/60 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm text-cyan-300/70">מטרה ראשית</span>
              <select
                value={brand.objective}
                onChange={(e) => update({ objective: e.target.value })}
                className="mt-1 w-full rounded-xl border border-cyan-500/30 bg-black/40 px-4 py-2.5 text-right text-cyan-100 focus:border-magenta-500/60 focus:outline-none"
              >
                {OBJECTIVES.map((o) => (
                  <option key={o} value={o} className="bg-slate-900">
                    {o}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Colors */}
        <div className="glass rounded-3xl p-6 text-right border border-cyan-500/20">
          <h2 className="text-xl font-black text-cyan-100">פלטת צבעים</h2>
          <div className="mt-4 flex flex-col gap-3">
            {brand.colors.map((c, i) => (
              <div key={i} className="flex items-center justify-end gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-cyan-100">
                    {COLOR_LABELS[i]}
                  </p>
                  <p className="text-xs text-cyan-300/50" dir="ltr">
                    {c.toUpperCase()}
                  </p>
                </div>
                <input
                  type="color"
                  value={c}
                  onChange={(e) => updateColor(i, e.target.value)}
                  className="h-12 w-12 cursor-pointer rounded-xl border border-cyan-500/30 bg-transparent"
                  style={{ boxShadow: `0 0 12px ${c}` }}
                />
              </div>
            ))}
          </div>
          {/* Live preview */}
          <div
            className="mt-5 flex h-20 items-center justify-center rounded-2xl text-lg font-black text-white"
            style={{
              background: `linear-gradient(135deg, ${brand.colors[0]}, ${brand.colors[1]}, ${brand.colors[2]})`,
            }}
          >
            {brand.name || "המותג שלך"}
          </div>
        </div>
      </section>

      {/* Tone */}
      <section className="glass rounded-3xl p-6 text-right border border-cyan-500/20">
        <h2 className="text-xl font-black text-cyan-100">טון דיבור</h2>
        <p className="mt-1 text-sm text-cyan-300/60">
          בחר את הטון שמאפיין את המותג שלך
        </p>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {TONES.map((t) => {
            const active = brand.tone === t;
            return (
              <button
                key={t}
                onClick={() => update({ tone: t })}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                  active
                    ? "border border-magenta-500/70 bg-magenta-900/30 neon-magenta"
                    : "border border-cyan-500/30 text-cyan-300/60 hover:border-cyan-500/60 hover:text-cyan-200"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
