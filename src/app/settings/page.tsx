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
      <section className="glass rounded-3xl border border-cyan-500/20 p-6 md:p-8">
        <p className="text-sm font-bold uppercase tracking-wide neon-cyan neon-glow">
          Settings
        </p>
        <h1 className="mt-2 text-4xl font-black text-gradient">הגדרות ⚙️</h1>
        <p className="mt-3 max-w-2xl text-cyan-200/70">
          ניהול חשבון, ערוצים מחוברים והעדפות מערכת.
        </p>
      </section>

      {/* Account */}
      <section className="glass rounded-3xl border border-cyan-500/20 p-6 text-right">
        <h2 className="text-xl font-black text-cyan-100">פרטי חשבון</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-cyan-500/20 bg-black/40 p-4">
            <p className="text-xs text-cyan-300/50">שם</p>
            <p className="mt-1 font-bold">
              {session?.user?.name || "Guy Rosenberg"}
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-black/40 p-4">
            <p className="text-xs text-cyan-300/50">אימייל</p>
            <p className="mt-1 font-bold" dir="ltr">
              {session?.user?.email || "guyro76@gmail.com"}
            </p>
          </div>
        </div>
      </section>

      {/* Connected platforms */}
      <section className="glass rounded-3xl border border-cyan-500/20 p-6 text-right">
        <h2 className="text-xl font-black text-cyan-100">ערוצים חברתיים</h2>
        <p className="mt-2 text-sm text-cyan-200/70">
          חיבור ישיר לפרסום אוטומטי — בקרוב. בינתיים: צור תוכן, הורד אותו
          כתמונות, ופרסם בכל רשת בכמה שניות.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-between rounded-2xl border border-cyan-500/20 bg-black/40 p-4"
            >
              <button
                onClick={() =>
                  toast.message(
                    "חיבור ישיר לרשתות — בקרוב. בינתיים אפשר להוריד את התוכן ולפרסם ידנית 🙂"
                  )
                }
                className="rounded-full border border-magenta-500/40 px-4 py-1 text-xs font-bold neon-magenta transition-all hover:shadow-lg"
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
