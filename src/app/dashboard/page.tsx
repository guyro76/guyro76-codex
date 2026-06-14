"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { DailyTip } from "@/components/DailyTip";

const PLATFORMS = [
  {
    name: "LinkedIn",
    score: 92,
    tip: "בנה סדרת דעה מקצועית שבועית",
  },
  {
    name: "Instagram",
    score: 84,
    tip: "אחד את שפת הקרוסלות והריילסים",
  },
  {
    name: "Facebook",
    score: 81,
    tip: "שלב יותר סיפור אישי וקהילה",
  },
  {
    name: "TikTok",
    score: 78,
    tip: "פתח כל סרטון ב-Hook של 3 שניות",
  },
];

const METRICS = [
  { label: "עקביות", value: "91%", icon: "🎯" },
  { label: "מעורבות", value: "6.8%", icon: "📊" },
  { label: "צמיחת עוקבים", value: "18%+", icon: "📈" },
];

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06060b] text-white">
        <div className="animate-pulse">טוען...</div>
      </div>
    );
  }

  return (
    <AppShell score={87}>
      {/* Hero - Authority Command Center */}
      <section className="rounded-3xl border border-white/5 bg-[#0e0e16] p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row-reverse">
          {/* Right: score + metrics */}
          <div className="flex-1 text-right">
            <p className="text-sm font-bold uppercase tracking-wide text-sky-300">
              Authority Command Center
            </p>
            <h1 className="mt-2 text-5xl font-black leading-none md:text-6xl">
              ציון סמכות 87/100
            </h1>
            <p className="mt-4 max-w-xl text-slate-400 ms-auto">
              המערכת הופכת נתוני פרופיל, פעילות, טרנדים ותבניות הצלחה לתוכנית
              צמיחה יומית.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {METRICS.map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-white/5 bg-[#06060b] p-5 text-center"
                >
                  <div className="text-2xl">{m.icon}</div>
                  <p className="mt-2 text-sm text-slate-400">{m.label}</p>
                  <p className="mt-1 text-3xl font-black">{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Left: today's task */}
          <div className="flex w-full flex-col justify-between rounded-3xl bg-sky-300 p-6 text-slate-900 lg:w-72">
            <div className="text-right">
              <div className="text-2xl">🎯</div>
              <p className="mt-3 text-sm font-semibold opacity-70">משימת היום</p>
              <p className="mt-2 text-xl font-extrabold leading-snug">
                פרסם טיפ אחד, הגב ל-10 מומחים והפוך פוסט לקרוסלה.
              </p>
            </div>
            <Link
              href="/content-factory?type=carousel"
              className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
            >
              צור תוכן <span aria-hidden>▷</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Daily Tip */}
      <section>
        <DailyTip />
      </section>

      {/* Platform breakdown */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PLATFORMS.map((p) => (
          <div
            key={p.name}
            className="flex items-center justify-between rounded-3xl border border-white/5 bg-[#0e0e16] p-6"
          >
            <span className="rounded-full bg-[#06060b] px-3 py-1 text-sm font-bold text-slate-300">
              {p.score}/100
            </span>
            <div className="text-right">
              <h3 className="text-2xl font-black">{p.name}</h3>
              <p className="mt-1 text-sm text-slate-400">{p.tip}</p>
            </div>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
