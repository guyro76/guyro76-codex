"use client";

import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getBrand,
  saveBrand,
  applyBrandHue,
  hexToHue,
  TONES,
  OBJECTIVES,
  type Brand,
} from "@/lib/brand-store";

const COLOR_LABELS = ["צבע ראשי", "צבע משני", "צבע הדגשה"];

export default function BrandKitPage() {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const b = getBrand();
    setBrand(b);
    applyBrandHue(b.hue);
  }, []);

  // Warn before losing unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!brand) {
    return (
      <AppShell>
        <div className="glass rounded-3xl p-10 text-center ink-muted" role="status">
          טוען...
        </div>
      </AppShell>
    );
  }

  const update = (patch: Partial<Brand>) => {
    setBrand((b) => (b ? { ...b, ...patch } : b));
    setDirty(true);
  };

  const updateColor = (i: number, hex: string) => {
    const colors = [...brand.colors];
    colors[i] = hex;
    update({ colors });
    // The primary colour drives the whole interface, so preview it live.
    if (i === 0 && brand.hue !== null) applyBrandHue(hexToHue(hex));
  };

  const togglePin = () => {
    if (brand.hue === null) {
      const hue = hexToHue(brand.colors[0]);
      if (hue === null) {
        toast.error("הצבע הראשי אפור מדי כדי לגזור ממנו גוון. בחר צבע רווי יותר.");
        return;
      }
      update({ hue });
      applyBrandHue(hue);
    } else {
      update({ hue: null });
      applyBrandHue(null);
    }
  };

  const handleSave = () => {
    saveBrand(brand);
    setDirty(false);
    toast.success("זהות המותג נשמרה — תוזן אוטומטית בכל יצירת תוכן");
  };

  return (
    <AppShell>
      <section className="glass-strong rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-2xl accent-surface px-5 py-2.5 text-sm font-bold"
          >
            <Icon name="sparkles" size={16} />
            {dirty ? "שמור שינויים" : "שמור זהות"}
          </button>
          <div className="text-right">
            <p className="text-sm font-bold uppercase tracking-wide accent-ink">
              Brand Identity
            </p>
            <h1 className="mt-2 text-4xl font-black text-gradient">Brand Kit</h1>
            <p className="mt-2 max-w-2xl ink-muted">
              הגדר את זהות המותג פעם אחת — קהל, טון, מטרה וצבעים. המערכת תשתמש
              בה כברירת מחדל בכל תוכן שתיצור.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Identity */}
        <div className="glass rounded-3xl p-6 text-right">
          <h2 className="text-xl font-black ink">פרטי מותג</h2>
          <div className="mt-4 flex flex-col gap-4">
            <label className="block">
              <span className="text-sm ink-muted">שם המותג</span>
              <input
                value={brand.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="לדוגמה: Postwave"
                autoComplete="organization"
                className="mt-1 w-full rounded-xl surface-solid px-4 py-2.5 text-right"
              />
            </label>

            <label className="block">
              <span className="text-sm ink-muted">קהל יעד</span>
              <input
                value={brand.audience}
                onChange={(e) => update({ audience: e.target.value })}
                placeholder="לדוגמה: בעלי עסקים קטנים"
                className="mt-1 w-full rounded-xl surface-solid px-4 py-2.5 text-right"
              />
            </label>

            <label className="block">
              <span className="text-sm ink-muted">מטרה ראשית</span>
              <select
                value={brand.objective}
                onChange={(e) => update({ objective: e.target.value })}
                className="mt-1 w-full rounded-xl surface-solid px-4 py-2.5 text-right"
              >
                {OBJECTIVES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Colours */}
        <div className="glass rounded-3xl p-6 text-right">
          <h2 className="text-xl font-black ink">פלטת צבעים</h2>
          <div className="mt-4 flex flex-col gap-3">
            {brand.colors.map((c, i) => (
              <div key={i} className="flex items-center justify-end gap-3">
                <div className="text-right">
                  <label htmlFor={`color-${i}`} className="text-sm font-bold ink">
                    {COLOR_LABELS[i]}
                  </label>
                  <p className="text-xs ink-muted tabular" dir="ltr">
                    {c.toUpperCase()}
                  </p>
                </div>
                <input
                  id={`color-${i}`}
                  type="color"
                  value={c}
                  onChange={(e) => updateColor(i, e.target.value)}
                  className="h-12 w-12 cursor-pointer rounded-xl surface-solid"
                />
              </div>
            ))}
          </div>

          <div
            className="mt-5 flex h-20 items-center justify-center rounded-2xl text-lg font-black text-white"
            style={{
              background: `linear-gradient(135deg, ${brand.colors[0]}, ${brand.colors[1]}, ${brand.colors[2]})`,
            }}
          >
            {brand.name || "המותג שלך"}
          </div>

          {/* The palette can drive the whole interface, not just the exports. */}
          <button
            onClick={togglePin}
            aria-pressed={brand.hue !== null}
            className="mt-4 w-full rounded-2xl surface-solid px-4 py-2.5 text-sm font-bold ink"
          >
            {brand.hue === null
              ? "צבע את הממשק בצבע המותג"
              : `הממשק נעול על גוון ${Math.round(brand.hue)}° — שחרר`}
          </button>
          <p className="mt-2 text-xs ink-muted">
            כברירת מחדל גוון הממשק נע לאט. נעילה מקבעת אותו על צבע המותג שלך.
          </p>
        </div>
      </section>

      {/* Tone */}
      <section className="glass rounded-3xl p-6 text-right">
        <h2 className="text-xl font-black ink">טון דיבור</h2>
        <p className="mt-1 text-sm ink-muted">בחר את הטון שמאפיין את המותג שלך</p>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {TONES.map((t) => {
            const active = brand.tone === t;
            return (
              <button
                key={t}
                onClick={() => update({ tone: t })}
                aria-pressed={active}
                className={
                  active
                    ? "rounded-full accent-surface px-4 py-2 text-sm font-bold"
                    : "rounded-full surface-solid px-4 py-2 text-sm font-bold ink-muted"
                }
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
