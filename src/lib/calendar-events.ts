// Pre-loaded events for the content calendar: Israeli holidays (year-specific,
// Gregorian dates for 2026/5786–5787) plus recurring global marketing days.
// Used to help plan content around key dates.

export interface CalendarEvent {
  title: string;
  emoji: string;
  kind: "holiday" | "marketing";
}

// Year-specific dates, keyed by full ISO date (YYYY-MM-DD).
export const DATED_EVENTS: Record<string, CalendarEvent> = {
  "2026-02-02": { title: 'ט"ו בשבט', emoji: "🌳", kind: "holiday" },
  "2026-03-03": { title: "פורים", emoji: "🎭", kind: "holiday" },
  "2026-04-01": { title: "ערב פסח", emoji: "🍷", kind: "holiday" },
  "2026-04-02": { title: "פסח", emoji: "🍷", kind: "holiday" },
  "2026-04-14": { title: "יום השואה", emoji: "🕯️", kind: "holiday" },
  "2026-04-21": { title: "יום הזיכרון", emoji: "🇮🇱", kind: "holiday" },
  "2026-04-22": { title: "יום העצמאות", emoji: "🎆", kind: "holiday" },
  "2026-05-05": { title: 'ל"ג בעומר', emoji: "🔥", kind: "holiday" },
  "2026-05-22": { title: "שבועות", emoji: "🌾", kind: "holiday" },
  "2026-07-29": { title: 'ט"ו באב (חג האהבה)', emoji: "💞", kind: "holiday" },
  "2026-09-12": { title: "ראש השנה", emoji: "🍎", kind: "holiday" },
  "2026-09-21": { title: "יום כיפור", emoji: "🕊️", kind: "holiday" },
  "2026-09-26": { title: "סוכות", emoji: "🌿", kind: "holiday" },
  "2026-10-03": { title: "שמחת תורה", emoji: "📜", kind: "holiday" },
  "2026-12-05": { title: "חנוכה", emoji: "🕎", kind: "holiday" },
  "2026-11-27": { title: "בלאק פריידיי", emoji: "🛍️", kind: "marketing" },
  "2026-11-30": { title: "סייבר מאנדיי", emoji: "💻", kind: "marketing" },
};

// Recurring global marketing days, keyed by month-day (MM-DD) — every year.
export const RECURRING_EVENTS: Record<string, CalendarEvent> = {
  "01-01": { title: "ראש השנה הלועזי", emoji: "🎉", kind: "marketing" },
  "02-14": { title: "ולנטיין", emoji: "❤️", kind: "marketing" },
  "03-08": { title: "יום האישה הבינלאומי", emoji: "👩", kind: "marketing" },
  "10-31": { title: "האלווין", emoji: "🎃", kind: "marketing" },
  "12-25": { title: "חג המולד", emoji: "🎄", kind: "marketing" },
  "12-31": { title: "ערב השנה החדשה", emoji: "🎆", kind: "marketing" },
};

export function getEventForDate(iso: string): CalendarEvent | null {
  if (DATED_EVENTS[iso]) return DATED_EVENTS[iso];
  const md = iso.slice(5); // MM-DD
  return RECURRING_EVENTS[md] || null;
}
