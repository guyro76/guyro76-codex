"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { DailyTip } from "@/components/DailyTip";
import { Icon } from "@/components/Icons";

const PLATFORMS = [
  { name: "LinkedIn", score: 92, tip: "בנה סדרת דעה מקצועית שבועית", icon: "target" as const },
  { name: "Instagram", score: 84, tip: "אחד את שפת הקרוסלות והריילסים", icon: "sparkles" as const },
  { name: "Facebook", score: 81, tip: "שלב יותר סיפור אישי וקהילה", icon: "users" as const },
  { name: "TikTok", score: 78, tip: "פתח כל סרטון ב-Hook של 3 שניות", icon: "rocket" as const },
];

const METRICS = [
  { label: "עקביות", value: "91%", color: "text-pink-600" },
  { label: "מעורבות", value: "6.8%", color: "text-violet-600" },
  { label: "צמיחת עוקבים", value: "18%+", color: "text-sky-600" },
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
      <section className="glass rounded-3xl p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row-reverse">
          {/* Right: score + metrics */}
          <div className="flex-1 text-right">
            <p className="text-sm font-bold uppercase tracking-wide bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              Authority Command Center
            </p>
            <h1 className="mt-2 text-5xl font-black leading-none md:text-6xl text-gradient">
              ציון סמכות 87/100
            </h1>
            <p className="mt-4 max-w-xl text-slate-700 ms-auto">
              המערכת הופכת נתוני פרופיל, פעילות, טרנדים ותבניות הצלחה לתוכנית
              צמיחה יומית.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {METRICS.map((m) => (
                <div
                  key={m.label}
                  className="glass rounded-2xl p-5 text-center"
                >
                  <p className={`text-3xl font-black ${m.color}`}>{m.value}</p>
                  <p className="mt-2 text-sm text-slate-600 font-semibold">{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Left: today's task */}
          <div className="flex w-full flex-col justify-between rounded-3xl bg-gradient-to-br from-pink-200 to-violet-200 p-6 shadow-lg lg:w-72">
            <div className="text-right">
              <Icon name="target" size={28} className="text-pink-600" />
              <p className="mt-3 text-sm font-semibold text-slate-700">משימת היום</p>
              <p className="mt-2 text-xl font-extrabold leading-snug text-slate-800">
                פרסם טיפ אחד, הגב ל-10 מומחים והפוך פוסט לקרוסלה.
              </p>
            </div>
            <Link
              href="/content-factory?type=carousel"
              className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-3 text-sm font-bold text-white transition-all hover:shadow-lg"
            >
              צור תוכן
              <Icon name="rocket" size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick create — every content type one click away */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/library"
            className="glass rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white/40 transition-colors"
          >
            <Icon name="library" size={16} className="inline mr-2" />
            הספרייה שלי
          </Link>
          <h2 className="text-right text-lg font-bold text-slate-800">
            צור תוכן חדש
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { type: "carousel", label: "קרוסלה", icon: "carousel" as const },
            { type: "post", label: "פוסט", icon: "post" as const },
            { type: "presentation", label: "מצגת", icon: "presentation" as const },
            { type: "reels", label: "רילס", icon: "reels" as const },
            { type: "story", label: "סטורי", icon: "story" as const },
          ].map((c) => (
            <Link
              key={c.type}
              href={`/content-factory?type=${c.type}`}
              className="group glass rounded-2xl p-5 text-center transition-all hover:bg-white/50 hover:shadow-md"
            >
              <div className="relative mb-3 flex justify-center">
                <Icon name={c.icon} size={32} className="text-violet-600" />
              </div>
              <div className="relative text-sm font-bold text-slate-800">
                {c.label}
              </div>
            </Link>
          ))}
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
            className="glass flex items-center justify-between rounded-3xl p-6 hover:bg-white/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="glass rounded-full px-3 py-1 text-sm font-bold text-violet-600">
                {p.score}/100
              </span>
              <Icon name={p.icon} size={24} className="text-pink-600" />
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-black text-slate-800">{p.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{p.tip}</p>
            </div>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
