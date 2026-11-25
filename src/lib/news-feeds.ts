// Live news feeds for the header ticker and the Trends page.
//
// Source is Google News RSS, queried per topic in Hebrew (hl=he, gl=IL).
// Two things need care:
//
//  1. Google appends " - Publisher" to every title and repeats the publisher
//     in a <source> element. The raw title reads badly in a ticker, so the
//     suffix is stripped and the publisher kept separately.
//  2. Results cluster: ask for eight topics and the first twenty items are
//     mostly the first topic. Trends interleaves round-robin instead.

import axios from "axios";
import * as cheerio from "cheerio";

export interface Headline {
  title: string;
  url: string;
  source: string;
  topic: string;
  publishedAt?: string;
}

export interface Category {
  /** Short label shown on the chip. */
  topic: string;
  query: string;
}

// Each query carries its own domain anchor. Bare terms like "טרנדים" or
// "סושיאל" pull general news — football gossip and TV ratings — which is
// useless as a content prompt for a marketer.
export const CATEGORIES: Category[] = [
  { topic: "AI", query: "בינה מלאכותית כלים עסקים" },
  { topic: "AI", query: "OpenAI OR Anthropic OR Gemini מודל חדש" },
  { topic: "טרנדים", query: "טרנד ויראלי רשתות חברתיות תוכן" },
  { topic: "אינסטגרם", query: "אינסטגרם פיצ'ר חדש יוצרי תוכן" },
  { topic: "טיקטוק", query: "טיקטוק אלגוריתם שיווק מותגים" },
  { topic: "פייסבוק", query: "מטא פייסבוק פרסום מודעות" },
  { topic: "שיווק", query: "שיווק דיגיטלי אסטרטגיה מותגים" },
  { topic: "סושיאל", query: "ניהול סושיאל מדיה שיווק עסקים" },
];

// Evergreen Hebrew lines so the ticker is never empty when the feed is down.
const FALLBACK: Headline[] = [
  { title: "קרוסלות מקבלות פי 3 יותר שמירות מפוסט בודד — התחילו מהוק חזק", url: "#", source: "Postwave", topic: "שיווק" },
  { title: "הוק של 3 שניות קובע אם הרילס ייצפה עד הסוף", url: "#", source: "Postwave", topic: "טרנדים" },
  { title: "תוכן עם נתון מספרי מצוטט הרבה יותר על ידי מנועי AI", url: "#", source: "Postwave", topic: "AI" },
  { title: "פרסום עקבי מנצח פרסום מושלם — 2 פוסטים בשבוע מספיקים", url: "#", source: "Postwave", topic: "סושיאל" },
];

/** Google News puts " - Publisher" at the end of every title. */
function cleanTitle(raw: string, source: string): string {
  let t = raw.trim();
  if (source) {
    const suffix = ` - ${source}`;
    if (t.endsWith(suffix)) t = t.slice(0, -suffix.length);
  }
  // Some feeds repeat it as "… - X | X".
  t = t.replace(/\s*[-–|]\s*[^-–|]{1,40}$/u, (m) =>
    source && m.includes(source) ? "" : m
  );
  return t.trim();
}

async function fetchOne(cat: Category, limit: number): Promise<Headline[]> {
  const url =
    "https://news.google.com/rss/search?q=" +
    encodeURIComponent(cat.query) +
    "&hl=he&gl=IL&ceid=IL:he";

  const res = await axios.get<string>(url, {
    timeout: 8000,
    responseType: "text",
    // A bare client name: never identify the user to an outside service.
    headers: { "User-Agent": "PostwaveBot/1.0 (+RSS reader)" },
  });

  // xmlMode keeps tag case, so <pubDate> and <source> stay addressable.
  const $ = cheerio.load(res.data, { xmlMode: true });
  const out: Headline[] = [];

  $("item").each((_, el) => {
    if (out.length >= limit) return;
    const node = $(el);
    const source = node.find("source").first().text().trim();
    const rawTitle = node.find("title").first().text();
    const link = node.find("link").first().text().trim();
    const pub = node.find("pubDate").first().text().trim();
    const title = cleanTitle(rawTitle, source);
    if (title && link) {
      out.push({
        title,
        url: link,
        source: source || "Google News",
        topic: cat.topic,
        publishedAt: pub || undefined,
      });
    }
  });

  return out;
}

// A short in-process cache. The page has a refresh button, and without this
// every click would fan out eight outbound requests.
const cache = new Map<string, { at: number; data: Headline[] }>();
const TTL_MS = 4 * 60 * 1000;

function dedupe(items: Headline[]): Headline[] {
  const seen = new Set<string>();
  return items.filter((h) => {
    const key = h.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Fetch across categories and interleave round-robin, so the result is a mix
 * of topics rather than everything from whichever query returned most.
 */
export async function fetchHeadlines(opts: {
  categories?: Category[];
  perCategory?: number;
  limit?: number;
  cacheKey?: string;
} = {}): Promise<Headline[]> {
  const categories = opts.categories ?? CATEGORIES;
  const perCategory = opts.perCategory ?? 4;
  const limit = opts.limit ?? 24;
  const key = opts.cacheKey ?? `${categories.map((c) => c.query).join("|")}:${limit}`;

  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;

  const settled = await Promise.allSettled(
    categories.map((c) => fetchOne(c, perCategory))
  );
  const buckets = settled
    .map((r) => (r.status === "fulfilled" ? r.value : []))
    .filter((b) => b.length > 0);

  // Round-robin so no single topic dominates the top of the list.
  const merged: Headline[] = [];
  for (let i = 0; merged.length < limit; i++) {
    let added = false;
    for (const b of buckets) {
      if (b[i]) {
        merged.push(b[i]);
        added = true;
        if (merged.length >= limit) break;
      }
    }
    if (!added) break;
  }

  const result = dedupe(merged);
  if (result.length === 0) return FALLBACK;

  cache.set(key, { at: Date.now(), data: result });
  return result;
}

export { FALLBACK as FALLBACK_HEADLINES };
