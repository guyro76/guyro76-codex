"use client";

import { AppShell } from "@/components/AppShell";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const PLATFORMS = [
  { name: "LinkedIn", icon: "in" },
  { name: "Instagram", icon: "📷" },
  { name: "Facebook", icon: "f" },
  { name: "TikTok", icon: "♪" },
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
        <h2 className="text-xl font-black">ערוצים חברתיים</h2>
        <p className="mt-2 text-sm text-slate-400">
          חיבור ישיר לפרסום אוטומטי — בקרוב. בינתיים: צור תוכן, הורד אותו
          כתמונות, ופרסם בכל רשת בכמה שניות.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-between rounded-2xl bg-[#06060b] p-4"
            >
              <button
                onClick={() =>
                  toast.message(
                    "חיבור ישיר לרשתות — בקרוב. בינתיים אפשר להוריד את התוכן ולפרסם ידנית 🙂"
                  )
                }
                className="rounded-full bg-sky-400/10 px-4 py-1 text-xs font-bold text-sky-300 transition-colors hover:bg-sky-400/20"
              >
                התחבר
              </button>
              <span className="flex items-center gap-2 font-bold">
                {p.name}
                <span
                  aria-hidden
                  className="grid h-7 w-7 place-items-center rounded-lg bg-white/5 text-xs"
                >
                  {p.icon}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
