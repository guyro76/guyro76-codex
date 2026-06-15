"use client";

import { AppShell } from "@/components/AppShell";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/Icons";

interface Trend {
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string;
}

// Neon color per category so the feed is easy to scan.
const CAT_COLOR: Record<string, string> = {
  "בינה מלאכותית": "neon-lime",
  "חברות AI": "neon-lime",
  טרנדים: "neon-magenta",
  אינסטגרם: "neon-pink",
  טיקטוק: "neon-cyan",
  פייסבוק: "neon-purple",
  "שיווק דיגיטלי": "neon-magenta",
  "ניהול סושיאל": "neon-cyan",
};

export default function TrendsPage() {
  const router = useRouter();
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news/trends?t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setTrends(data.trends || []);
      setUpdatedAt(data.updatedAt || Date.now());
    } catch {
      setTrends([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = (t: Trend) =>
    router.push(
      `/content-factory?type=carousel&topic=${encodeURIComponent(t.title)}`
    );

  const timeLabel = updatedAt
    ? new Date(updatedAt).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <AppShell>
      <section className="glass-strong rounded-3xl p-6 md:p-8 border border-magenta-500/30">
        <div className="flex items-start justify-between gap-4">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl border border-cyan-500/50 bg-gradient-to-r from-cyan-900/40 to-magenta-900/40 px-5 py-2.5 text-sm font-bold neon-cyan transition-all hover:shadow-lg disabled:opacity-50"
          >
            <span className={loading ? "animate-spin" : ""}>↻</span>
            {loading ? "מרענן..." : "רענן תכנים"}
          </button>
          <div className="text-right">
            <p className="text-sm font-bold uppercase tracking-wide neon-cyan neon-glow">
              🔥 TREND RADAR
            </p>
            <h1 className="mt-2 text-4xl font-black text-gradient">
              נושאים חמים
            </h1>
            <p className="mt-2 max-w-2xl text-cyan-200/80 text-sm">
              חדשות חיות מהאינטרנט — בינה מלאכותית, חברות AI, טרנדים ברשתות,
              אינסטגרם, טיקטוק, פייסבוק, שיווק דיגיטלי וניהול סושיאל. לחץ על נושא
              כדי להפוך אותו לתוכן.
              {timeLabel && (
                <span className="block mt-1 text-xs text-cyan-300/50">
                  עודכן: {timeLabel}
                </span>
              )}
            </p>
          </div>
        </div>
      </section>

      {loading && trends.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center text-cyan-300/70 animate-pulse">
          מושך טרנדים חיים מהרשת...
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {trends.map((t, i) => {
            const color = CAT_COLOR[t.category] || "neon-cyan";
            return (
              <div
                key={`${t.url}-${i}`}
                className="glass flex flex-col justify-between gap-3 rounded-3xl p-5 border border-cyan-500/20 hover:border-magenta-500/50 transition-all"
              >
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span
                      className={`rounded-full border border-current/40 px-2 py-0.5 text-[11px] font-bold ${color}`}
                    >
                      {t.category}
                    </span>
                    <h3 className="text-base font-black text-cyan-100 leading-tight">
                      {t.title}
                    </h3>
                  </div>
                  {t.summary && (
                    <p className="mt-2 text-sm text-cyan-200/60">{t.summary}</p>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => create(t)}
                    className="flex items-center gap-2 rounded-2xl border border-magenta-500/50 bg-magenta-900/20 px-4 py-2 text-sm font-bold neon-magenta transition-all hover:shadow-lg"
                  >
                    <Icon name="sparkles" size={14} />
                    צור תוכן
                  </button>
                  {t.url && t.url !== "#" && (
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-cyan-300/50 hover:text-cyan-300"
                    >
                      {t.source} ↗
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </AppShell>
  );
}
