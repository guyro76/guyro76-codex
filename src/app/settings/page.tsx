"use client";

import { AppShell } from "@/components/AppShell";
import { useSession } from "next-auth/react";

const PLATFORMS = [
  { name: "LinkedIn", connected: true },
  { name: "Instagram", connected: true },
  { name: "Facebook", connected: true },
  { name: "TikTok", connected: true },
];

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <AppShell>
      <section className="rounded-3xl border border-white/5 bg-[#0e0e16] p-6 md:p-8">
        <p className="text-sm font-bold uppercase tracking-wide text-sky-300">
          Settings
        </p>
        <h1 className="mt-2 text-4xl font-black">הגדרות ⚙️</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          ניהול חשבון, ערוצים מחוברים והעדפות מערכת.
        </p>
      </section>

      {/* Account */}
      <section className="rounded-3xl border border-white/5 bg-[#0e0e16] p-6 text-right">
        <h2 className="text-xl font-black">פרטי חשבון</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#06060b] p-4">
            <p className="text-xs text-slate-500">שם</p>
            <p className="mt-1 font-bold">
              {session?.user?.name || "Guy Rosenberg"}
            </p>
          </div>
          <div className="rounded-2xl bg-[#06060b] p-4">
            <p className="text-xs text-slate-500">אימייל</p>
            <p className="mt-1 font-bold" dir="ltr">
              {session?.user?.email || "guyro76@gmail.com"}
            </p>
          </div>
        </div>
      </section>

      {/* Connected platforms */}
      <section className="rounded-3xl border border-white/5 bg-[#0e0e16] p-6 text-right">
        <h2 className="text-xl font-black">ערוצים מחוברים</h2>
        <div className="mt-4 flex flex-col gap-3">
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-between rounded-2xl bg-[#06060b] p-4"
            >
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  p.connected
                    ? "bg-emerald-400/10 text-emerald-400"
                    : "bg-slate-500/10 text-slate-400"
                }`}
              >
                {p.connected ? "● מחובר" : "מנותק"}
              </span>
              <span className="font-bold">{p.name}</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
