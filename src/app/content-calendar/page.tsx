"use client";

import { AppShell } from "@/components/AppShell";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getEventForDate } from "@/lib/calendar-events";

const HE_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const HE_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

const POST_TYPES = [
  { value: "קרוסלה", color: "bg-sky-400" },
  { value: "סטורי", color: "bg-fuchsia-400" },
  { value: "רילס", color: "bg-rose-400" },
  { value: "פוסט", color: "bg-emerald-400" },
  { value: "מאמר", color: "bg-amber-400" },
];
const PLATFORMS = ["Instagram", "Facebook", "LinkedIn", "TikTok"];

type View = "month" | "week" | "day";

interface Post {
  id: string;
  type: string;
  platform: string;
  color: string;
}

type Schedule = Record<string, Post[]>;

const STORE_KEY = "postwave:calendar";

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setDate(x.getDate() - x.getDay()); // Sunday
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a: Date, b: Date): boolean {
  return toISO(a) === toISO(b);
}

export default function ContentCalendarPage() {
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState<Date>(new Date(2026, 5, 14));
  const [schedule, setSchedule] = useState<Schedule>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [draft, setDraft] = useState({ type: "קרוסלה", platform: "Instagram" });

  const today = new Date(2026, 5, 14);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setSchedule(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (next: Schedule) => {
    setSchedule(next);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const addPost = (iso: string) => {
    const color =
      POST_TYPES.find((t) => t.value === draft.type)?.color || "bg-sky-400";
    const post: Post = {
      id: `${Date.now()}`,
      type: draft.type,
      platform: draft.platform,
      color,
    };
    persist({ ...schedule, [iso]: [...(schedule[iso] || []), post] });
    toast.success(`${draft.type} שובץ ל-${iso}`);
  };

  const removePost = (iso: string, id: string) => {
    persist({
      ...schedule,
      [iso]: (schedule[iso] || []).filter((p) => p.id !== id),
    });
  };

  const shift = (dir: number) => {
    const x = new Date(cursor);
    if (view === "month") x.setMonth(x.getMonth() + dir);
    else if (view === "week") x.setDate(x.getDate() + dir * 7);
    else x.setDate(x.getDate() + dir);
    setCursor(x);
  };

  const periodLabel = useMemo(() => {
    if (view === "month")
      return `${HE_MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
    if (view === "week") {
      const s = startOfWeek(cursor);
      const e = new Date(s);
      e.setDate(e.getDate() + 6);
      return `${s.getDate()} ${HE_MONTHS[s.getMonth()]} – ${e.getDate()} ${HE_MONTHS[e.getMonth()]}`;
    }
    return `${cursor.getDate()} ${HE_MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
  }, [view, cursor]);

  // Build the list of dates to render for the current view.
  const monthCells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay()); // back to Sunday
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const weekDates = useMemo(() => {
    const s = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      return d;
    });
  }, [cursor]);

  return (
    <AppShell>
      <section className="rounded-3xl border border-white/5 bg-[#0e0e16] p-6 md:p-8">
        <p className="text-sm font-bold uppercase tracking-wide text-sky-300">
          Content Calendar
        </p>
        <h1 className="mt-2 text-4xl font-black">יומן תוכן 🗓️</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          תכנן קדימה: שבץ פוסטים בכל יום, עם חגים ואירועי שיווק טעונים מראש.
          חודשי · שבועי · יומי.
        </p>
      </section>

      {/* Toolbar */}
      <section className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-[#0e0e16] p-4 md:flex-row md:items-center md:justify-between">
        {/* View toggle */}
        <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
          {([
            ["month", "חודשי"],
            ["week", "שבועי"],
            ["day", "יומי"],
          ] as [View, string][]).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-xl px-4 py-1.5 text-sm font-bold transition-all ${
                view === v
                  ? "bg-sky-400 text-slate-950"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Period nav */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => shift(-1)}
            className="rounded-xl border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5"
          >
            →
          </button>
          <span className="min-w-[160px] text-center font-bold">
            {periodLabel}
          </span>
          <button
            onClick={() => shift(1)}
            className="rounded-xl border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5"
          >
            ←
          </button>
          <button
            onClick={() => setCursor(new Date(today))}
            className="rounded-xl bg-sky-400/10 px-3 py-1.5 text-sm font-bold text-sky-300 hover:bg-sky-400/20"
          >
            היום
          </button>
        </div>
      </section>

      {/* Month view */}
      {view === "month" && (
        <section className="rounded-3xl border border-white/5 bg-[#0e0e16] p-4">
          <div className="grid grid-cols-7 gap-2">
            {HE_DAYS.map((d) => (
              <p
                key={d}
                className="pb-2 text-center text-xs font-bold text-slate-500"
              >
                {d}
              </p>
            ))}
            {monthCells.map((d) => {
              const iso = toISO(d);
              const inMonth = d.getMonth() === cursor.getMonth();
              const ev = getEventForDate(iso);
              const posts = schedule[iso] || [];
              const isToday = sameDay(d, today);
              return (
                <button
                  key={iso}
                  onClick={() => setPicked(iso)}
                  className={`min-h-[92px] rounded-2xl border p-2 text-right transition-all ${
                    inMonth
                      ? "border-white/10 bg-[#06060b] hover:border-sky-400/40"
                      : "border-transparent bg-transparent opacity-40"
                  } ${isToday ? "ring-2 ring-sky-400/60" : ""}`}
                >
                  <span
                    className={`text-xs font-bold ${
                      isToday ? "text-sky-300" : "text-slate-400"
                    }`}
                  >
                    {d.getDate()}
                  </span>
                  {ev && (
                    <span
                      className={`mt-1 block truncate rounded-md px-1 py-0.5 text-[10px] font-bold ${
                        ev.kind === "holiday"
                          ? "bg-amber-400/15 text-amber-300"
                          : "bg-fuchsia-400/15 text-fuchsia-300"
                      }`}
                    >
                      {ev.emoji} {ev.title}
                    </span>
                  )}
                  <span className="mt-1 flex flex-wrap gap-1">
                    {posts.map((p) => (
                      <span
                        key={p.id}
                        className={`h-1.5 w-5 rounded-full ${p.color}`}
                        title={`${p.type} · ${p.platform}`}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Week view */}
      {view === "week" && (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {weekDates.map((d) => {
            const iso = toISO(d);
            const ev = getEventForDate(iso);
            const posts = schedule[iso] || [];
            const isToday = sameDay(d, today);
            return (
              <div
                key={iso}
                className={`flex min-h-[180px] flex-col rounded-3xl border bg-[#0e0e16] p-3 ${
                  isToday ? "border-sky-400/60" : "border-white/5"
                }`}
              >
                <p className="text-center text-xs font-bold text-slate-300">
                  {HE_DAYS[d.getDay()]} {d.getDate()}
                </p>
                {ev && (
                  <span className="mt-2 truncate rounded-md bg-amber-400/15 px-1 py-0.5 text-center text-[10px] font-bold text-amber-300">
                    {ev.emoji} {ev.title}
                  </span>
                )}
                <div className="mt-2 flex flex-1 flex-col gap-2">
                  {posts.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-2xl bg-[#06060b] p-2 text-right"
                    >
                      <div className={`mb-1 h-1.5 w-8 rounded-full ${p.color}`} />
                      <p className="text-sm font-bold">{p.type}</p>
                      <p className="text-xs text-slate-400">{p.platform}</p>
                      <button
                        onClick={() => removePost(iso, p.id)}
                        className="mt-1 text-[10px] text-rose-400 hover:underline"
                      >
                        הסר
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setPicked(iso)}
                    className="mt-auto rounded-xl border border-dashed border-white/15 py-1.5 text-xs text-slate-400 hover:border-sky-400/40 hover:text-sky-300"
                  >
                    + שבץ
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Day view */}
      {view === "day" && (
        <section className="rounded-3xl border border-white/5 bg-[#0e0e16] p-6">
          {(() => {
            const iso = toISO(cursor);
            const ev = getEventForDate(iso);
            const posts = schedule[iso] || [];
            return (
              <div className="text-right">
                <h2 className="text-2xl font-black">
                  {HE_DAYS[cursor.getDay()]}, {cursor.getDate()}{" "}
                  {HE_MONTHS[cursor.getMonth()]}
                </h2>
                {ev && (
                  <p className="mt-2 inline-block rounded-lg bg-amber-400/15 px-3 py-1 text-sm font-bold text-amber-300">
                    {ev.emoji} {ev.title}
                  </p>
                )}
                <div className="mt-5 flex flex-col gap-3">
                  {posts.length === 0 && (
                    <p className="text-slate-500">אין פוסטים מתוכננים ליום זה.</p>
                  )}
                  {posts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-2xl bg-[#06060b] p-4"
                    >
                      <button
                        onClick={() => removePost(iso, p.id)}
                        className="text-xs text-rose-400 hover:underline"
                      >
                        הסר
                      </button>
                      <span className="flex items-center gap-3 font-bold">
                        {p.type}
                        <span className="text-sm font-normal text-slate-400">
                          {p.platform}
                        </span>
                        <span className={`h-2.5 w-2.5 rounded-full ${p.color}`} />
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setPicked(iso)}
                  className="mt-5 rounded-xl bg-sky-400/10 px-5 py-2 text-sm font-bold text-sky-300 hover:bg-sky-400/20"
                >
                  + שבץ פוסט
                </button>
              </div>
            );
          })()}
        </section>
      )}

      {/* Schedule modal */}
      {picked && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setPicked(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0e0e16] p-6 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-black">שיבוץ פוסט · {picked}</h3>
            {getEventForDate(picked) && (
              <p className="mt-1 text-xs text-amber-300">
                {getEventForDate(picked)!.emoji}{" "}
                {getEventForDate(picked)!.title}
              </p>
            )}

            <label className="mt-4 block text-xs font-bold text-slate-400">
              סוג תוכן
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {POST_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setDraft({ ...draft, type: t.value })}
                  className={`rounded-xl px-3 py-1.5 text-sm font-bold transition-all ${
                    draft.type === t.value
                      ? "bg-sky-400 text-slate-950"
                      : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {t.value}
                </button>
              ))}
            </div>

            <label className="mt-4 block text-xs font-bold text-slate-400">
              פלטפורמה
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => setDraft({ ...draft, platform: p })}
                  className={`rounded-xl px-3 py-1.5 text-sm font-bold transition-all ${
                    draft.platform === p
                      ? "bg-sky-400 text-slate-950"
                      : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setPicked(null)}
                className="flex-1 rounded-xl bg-white/5 py-2 text-sm font-bold hover:bg-white/10"
              >
                סגור
              </button>
              <button
                onClick={() => {
                  addPost(picked);
                  setPicked(null);
                }}
                className="flex-1 rounded-xl bg-gradient-to-l from-cyan-500 to-sky-500 py-2 text-sm font-bold text-white"
              >
                שבץ ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
