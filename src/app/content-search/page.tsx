"use client";

import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import Link from "next/link";

type Result = { title: string; source: string; snippet: string };

const SAMPLE: Result[] = [
  {
    title: "כך בונים מותג אישי שמושך לקוחות",
    source: "Wikipedia",
    snippet: "עקרונות מותג אישי, עקביות ויצירת אמון לאורך זמן.",
  },
  {
    title: "5 טרנדים בשיווק תוכן ל-2026",
    source: "Google News",
    snippet: "וידאו קצר, AI ביצירת תוכן ושיווק מבוסס קהילה מובילים.",
  },
  {
    title: "הכוח של סטוריטלינג ברשתות",
    source: "Wikipedia",
    snippet: "סיפור אישי מגדיל מעורבות ומחזק זיכרון מותג.",
  },
];

export default function ContentSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    setResults(SAMPLE);
  };

  return (
    <AppShell>
      <section className="rounded-3xl border border-white/5 bg-[#0e0e16] p-6 md:p-8">
        <p className="text-sm font-bold uppercase tracking-wide text-sky-300">
          Content Discovery
        </p>
        <h1 className="mt-2 text-4xl font-black">חיפוש תוכן 🔎</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          מצא מקורות אמינים, חדשות וטרנדים רלוונטיים והפוך אותם לתוכן מקורי.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex gap-3">
          <button
            type="submit"
            className="rounded-2xl bg-sky-300 px-6 py-3 font-bold text-slate-900 transition-colors hover:bg-sky-200"
          >
            חפש
          </button>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="לדוגמה: בניית סמכות ב-LinkedIn"
            className="flex-1 rounded-2xl border border-white/10 bg-[#06060b] px-4 py-3 text-right text-white placeholder-slate-500 focus:border-sky-300 focus:outline-none"
          />
        </form>
      </section>

      {searched && (
        <section className="flex flex-col gap-3">
          {results.map((r) => (
            <div
              key={r.title}
              className="flex items-center justify-between rounded-3xl border border-white/5 bg-[#0e0e16] p-5"
            >
              <Link
                href="/content-factory?type=carousel"
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold transition-colors hover:bg-white/5"
              >
                הפוך לקרוסלה
              </Link>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="rounded-full bg-[#06060b] px-2 py-0.5 text-xs text-sky-300">
                    {r.source}
                  </span>
                  <h3 className="text-lg font-black">{r.title}</h3>
                </div>
                <p className="mt-1 text-sm text-slate-400">{r.snippet}</p>
              </div>
            </div>
          ))}
        </section>
      )}
    </AppShell>
  );
}
