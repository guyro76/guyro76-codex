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
      <section className="glass-strong rounded-3xl p-6 md:p-8 border border-magenta-500/30">
        <div className="flex flex-col gap-6 lg:flex-row-reverse">
          {/* Right: score + metrics */}
          <div className="flex-1 text-right">
            <p className="text-sm font-bold uppercase tracking-wide neon-cyan neon-glow">
              ⚡ AUTHORITY COMMAND CENTER
            </p>
            <h1 className="mt-3 text-5xl font-black leading-none md:text-6xl text-gradient animate-glow-text">
              ציון סמכות<br />87/100
            </h1>
            <p className="mt-4 max-w-xl text-cyan-200/80 ms-auto text-sm">
              המערכת הופכת נתוני פרופיל, פעילות, טרנדים ותבניות הצלחה לתוכנית
              צמיחה יומית.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {METRICS.map((m, i) => {
                const neonColors = ["neon-cyan", "neon-magenta", "neon-lime"];
                return (
                  <div
                    key={m.label}
                    className="glass rounded-2xl p-4 text-center border border-cyan-500/30 hover:border-magenta-500/50 transition-all hover:shadow-lg"
                  >
                    <p className={`text-3xl font-black ${neonColors[i]} neon-glow`}>{m.value}</p>
                    <p className="mt-2 text-xs text-cyan-300/70 font-semibold uppercase">{m.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Left: today's task */}
          <div className="flex w-full flex-col justify-between rounded-3xl border-2 border-magenta-500/50 bg-gradient-to-br from-magenta-900/20 to-cyan-900/20 p-6 shadow-2xl lg:w-72">
            <div className="text-right">
              <Icon name="target" size={28} className="neon-magenta animate-float-neon" />
              <p className="mt-3 text-sm font-semibold neon-cyan">משימת היום</p>
              <p className="mt-2 text-xl font-extrabold leading-snug text-cyan-100">
                פרסם טיפ אחד, הגב ל-10 מומחים והפוך פוסט לקרוסלה.
              </p>
            </div>
            <Link
              href="/content-factory?type=carousel"
              className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/50 bg-gradient-to-r from-cyan-900/40 to-magenta-900/40 px-5 py-3 text-sm font-bold text-cyan-300 transition-all hover:shadow-2xl hover:border-cyan-400/70 neon-glow"
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
            className="glass rounded-lg px-4 py-2 text-sm font-semibold neon-cyan border border-cyan-500/30 hover:border-cyan-500/70 transition-all hover:shadow-lg"
          >
            <Icon name="library" size={16} className="inline mr-2" />
            הספרייה שלי
          </Link>
          <h2 className="text-right text-lg font-bold text-gradient animate-glow-text">
            ⚡ צור תוכן חדש
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { type: "carousel", label: "קרוסלה", icon: "carousel" as const, color: "neon-cyan" as const },
            { type: "post", label: "פוסט", icon: "post" as const, color: "neon-magenta" as const },
            { type: "presentation", label: "מצגת", icon: "presentation" as const, color: "neon-lime" as const },
            { type: "reels", label: "רילס", icon: "reels" as const, color: "neon-purple" as const },
            { type: "story", label: "סטורי", icon: "story" as const, color: "neon-pink" as const },
          ].map((c, idx) => (
            <Link
              key={c.type}
              href={`/content-factory?type=${c.type}`}
              className="group glass rounded-2xl p-5 text-center transition-all border border-cyan-500/20 hover:border-magenta-500/50 hover:shadow-2xl"
            >
              <div className="relative mb-3 flex justify-center">
                <Icon name={c.icon} size={32} className={`${c.color} neon-glow animate-float-neon`} style={{animationDelay: `${idx * 0.2}s`}} />
              </div>
              <div className="relative text-sm font-bold text-cyan-300">
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
        {PLATFORMS.map((p, idx) => {
          const colors = ["neon-cyan", "neon-magenta", "neon-lime", "neon-purple"];
          return (
            <div
              key={p.name}
              className="glass flex items-center justify-between rounded-3xl p-6 border border-cyan-500/30 hover:border-magenta-500/50 transition-all hover:shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <span className="glass rounded-full px-3 py-1 text-sm font-bold border border-cyan-500/40 neon-glow neon-cyan">
                  {p.score}/100
                </span>
                <Icon name={p.icon} size={24} className={`${colors[idx]} neon-glow animate-float-neon`} style={{animationDelay: `${idx * 0.15}s`}} />
              </div>
              <div className="text-right">
                <h3 className="text-2xl font-black text-gradient">{p.name}</h3>
                <p className="mt-1 text-sm text-cyan-300/70">{p.tip}</p>
              </div>
            </div>
          );
        })}
      </section>
    </AppShell>
  );
}
