"use client";

import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@/components/Icons";

type Result = {
  title: string;
  summary: string;
  url: string;
  source: string;
};

export default function ContentSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("הזן נושא לחיפוש");
      return;
    }
    setLoading(true);
    setSearched(true);
    setMessage("");
    try {
      const res = await fetch(
        `/api/content/search?q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "החיפוש נכשל");
      setResults(data.results || []);
      if ((data.results || []).length === 0) {
        setMessage(data.message || "לא נמצאו תוצאות. נסה ניסוח אחר.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "שגיאה בחיפוש");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Turn a found source straight into content — pre-fill the factory's topic.
  const turnInto = (r: Result) => {
    router.push(
      `/content-factory?type=carousel&topic=${encodeURIComponent(r.title)}`
    );
  };

  return (
    <AppShell>
      <section className="glass-strong rounded-3xl p-6 md:p-8 border border-magenta-500/30">
        <p className="text-sm font-bold uppercase tracking-wide neon-cyan neon-glow">
          🔎 CONTENT DISCOVERY
        </p>
        <h1 className="mt-2 text-4xl font-black text-gradient">חיפוש תוכן</h1>
        <p className="mt-3 max-w-2xl text-cyan-200/80">
          מנוע חי שמושך חדשות אמיתיות (Google News) וערכי ידע (Wikipedia) — והופך
          כל מקור לתוכן מקורי בלחיצה.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl border border-cyan-500/50 bg-gradient-to-r from-cyan-900/40 to-magenta-900/40 px-6 py-3 font-bold neon-cyan transition-all hover:shadow-lg disabled:opacity-50"
          >
            {loading ? "מחפש..." : "חפש"}
          </button>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="לדוגמה: בינה מלאכותית בשיווק, טרנדים ב-LinkedIn"
            disabled={loading}
            className="flex-1 rounded-2xl border border-cyan-500/30 bg-black/40 px-4 py-3 text-right text-cyan-100 placeholder-cyan-300/40 focus:border-magenta-500/60 focus:outline-none"
          />
        </form>
      </section>

      {loading && (
        <div className="glass rounded-3xl p-10 text-center text-cyan-300/70 animate-pulse">
          מחפש מקורות אמינים ברשת...
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="glass rounded-3xl p-10 text-center text-cyan-300/70">
          {message || "לא נמצאו תוצאות."}
        </div>
      )}

      {!loading && results.length > 0 && (
        <section className="flex flex-col gap-3">
          {results.map((r, i) => (
            <div
              key={`${r.url}-${i}`}
              className="glass flex items-center justify-between gap-4 rounded-3xl p-5 border border-cyan-500/20 hover:border-magenta-500/50 transition-all"
            >
              <div className="flex shrink-0 flex-col gap-2">
                <button
                  onClick={() => turnInto(r)}
                  className="flex items-center gap-2 rounded-2xl border border-magenta-500/50 bg-magenta-900/20 px-4 py-2 text-sm font-bold neon-magenta transition-all hover:shadow-lg"
                >
                  <Icon name="sparkles" size={14} />
                  הפוך לתוכן
                </button>
                {r.url && r.url !== "#" && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-center text-xs text-cyan-300/50 hover:text-cyan-300"
                  >
                    מקור ↗
                  </a>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="rounded-full border border-cyan-500/30 px-2 py-0.5 text-xs neon-cyan">
                    {r.source}
                  </span>
                  <h3 className="text-lg font-black text-cyan-100">{r.title}</h3>
                </div>
                {r.summary && (
                  <p className="mt-1 text-sm text-cyan-200/60">{r.summary}</p>
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </AppShell>
  );
}
