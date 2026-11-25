"use client";

import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icons";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Trend {
  title: string;
  url: string;
  source: string;
  topic: string;
  publishedAt?: string;
}

// Each topic keeps a stable hue offset, so a chip's colour means something
// rather than being decorative. The offsets ride the global hue, so the chips
// re-tint with the rest of the palette.
const TOPIC_SHIFT: Record<string, number> = {
  AI: 150,
  טרנדים: 0,
  אינסטגרם: 300,
  טיקטוק: 200,
  פייסבוק: 250,
  שיווק: 55,
  סושיאל: 100,
};

function Chip({ topic }: { topic: string }) {
  const shift = TOPIC_SHIFT[topic] ?? 0;
  const h = `calc(var(--hue) + ${shift})`;
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[11px] font-bold"
      style={{
        // Both stops flip with the scheme. A fixed light tint at 50% alpha
        // lands as mid-grey over a dark canvas, which left dark text on it
        // at ~1.6:1 — the chips have to invert, not just fade.
        color: `light-dark(oklch(0.40 0.14 ${h}), oklch(0.92 0.09 ${h}))`,
        backgroundColor: `light-dark(oklch(0.90 0.07 ${h}), oklch(0.34 0.09 ${h}))`,
      }}
    >
      {topic}
    </span>
  );
}

export default function TrendsPage() {
  const router = useRouter();
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Cache-bust so the refresh button genuinely refetches.
      const res = await fetch(`/api/news/trends?t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setTrends(Array.isArray(data.trends) ? data.trends : []);
      setUpdatedAt(data.updatedAt ?? null);
      if (!data.trends?.length) setError("לא הצלחנו למשוך נושאים כרגע. נסה שוב בעוד רגע.");
    } catch {
      setError("החיבור לעדכונים נכשל. בדוק את החיבור לאינטרנט.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const makeContent = (title: string) => {
    router.push(`/content-factory?type=carousel&topic=${encodeURIComponent(title)}`);
  };

  const stamp = updatedAt
    ? new Intl.DateTimeFormat("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(updatedAt))
    : null;

  return (
    <AppShell>
      <section className="glass-strong rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl accent-surface px-5 py-2.5 text-sm font-bold disabled:opacity-60"
          >
            <span aria-hidden="true">↻</span>
            {loading ? "מרענן..." : "רענן תכנים"}
          </button>

          <div className="text-right">
            <p className="text-sm font-bold uppercase tracking-wide accent-ink">
              Trend Radar
            </p>
            <h1 className="mt-2 text-4xl font-black text-gradient">נושאים חמים</h1>
            <p className="mt-2 max-w-2xl ink-muted">
              חדשות חיות על בינה מלאכותית, טרנדים ברשתות, אינסטגרם, טיקטוק,
              פייסבוק ושיווק דיגיטלי. לחץ על נושא כדי להפוך אותו לתוכן.
            </p>
            {stamp && (
              <p className="mt-2 text-xs ink-muted tabular">
                עודכן ב-{stamp} · {trends.length} נושאים
              </p>
            )}
          </div>
        </div>
      </section>

      {error && (
        <div role="status" className="glass rounded-2xl p-4 text-right ink">
          {error}
        </div>
      )}

      {loading && trends.length === 0 ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass h-20 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {trends.map((t, i) => (
            <article
              key={`${t.url}-${i}`}
              className="glass flex items-center justify-between gap-4 rounded-2xl p-4 text-right"
            >
              <button
                onClick={() => makeContent(t.title)}
                className="flex-shrink-0 rounded-2xl accent-surface px-4 py-2 text-sm font-bold"
              >
                צור תוכן
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[11px] ink-muted">{t.source}</span>
                  <Chip topic={t.topic} />
                </div>
                <h2 className="mt-1 line-clamp-2 text-base font-bold ink">
                  {t.url && t.url !== "#" ? (
                    <a href={t.url} target="_blank" rel="noreferrer" className="hover:underline">
                      {t.title}
                    </a>
                  ) : (
                    t.title
                  )}
                </h2>
              </div>

              <Icon name="flame" size={20} className="flex-shrink-0 accent-ink" />
            </article>
          ))}
        </section>
      )}
    </AppShell>
  );
}
