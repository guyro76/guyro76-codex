"use client";

import { AppShell } from "@/components/AppShell";

const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

const PLAN: Record<string, { type: string; platform: string; color: string }[]> = {
  ראשון: [{ type: "קרוסלה", platform: "Instagram", color: "bg-sky-300" }],
  שני: [{ type: "פוסט דעה", platform: "LinkedIn", color: "bg-emerald-300" }],
  שלישי: [{ type: "רילס", platform: "TikTok", color: "bg-fuchsia-300" }],
  רביעי: [{ type: "סטורי", platform: "Instagram", color: "bg-sky-300" }],
  חמישי: [{ type: "מאמר", platform: "LinkedIn", color: "bg-emerald-300" }],
  שישי: [{ type: "קהילה", platform: "Facebook", color: "bg-amber-300" }],
  שבת: [],
};

export default function ContentCalendarPage() {
  return (
    <AppShell>
      <section className="rounded-3xl border border-white/5 bg-[#0e0e16] p-6 md:p-8">
        <p className="text-sm font-bold uppercase tracking-wide text-sky-300">
          Content Calendar
        </p>
        <h1 className="mt-2 text-4xl font-black">יומן תוכן 🗓️</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          תוכנית פרסום שבועית שנבנית אוטומטית לפי יעדי הסמכות שלך. גרור, ערוך
          ואשר בלחיצה.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {DAYS.map((day) => (
          <div
            key={day}
            className="flex min-h-[160px] flex-col rounded-3xl border border-white/5 bg-[#0e0e16] p-4"
          >
            <p className="text-center text-sm font-bold text-slate-300">{day}</p>
            <div className="mt-3 flex flex-1 flex-col gap-2">
              {PLAN[day].length === 0 ? (
                <p className="mt-auto text-center text-xs text-slate-600">
                  מנוחה
                </p>
              ) : (
                PLAN[day].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-[#06060b] p-3 text-right"
                  >
                    <div className={`mb-2 h-1.5 w-8 rounded-full ${item.color}`} />
                    <p className="text-sm font-bold">{item.type}</p>
                    <p className="text-xs text-slate-400">{item.platform}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
