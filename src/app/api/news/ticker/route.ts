import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

// Headline ticker for the header — live Google News RSS across the topics that
// matter to a content creator: digital marketing, social media management, and
// AI innovation / company updates. Cached briefly so we don't hammer the feed.

export const revalidate = 900; // 15 min ISR cache

interface Headline {
  title: string;
  url: string;
  source: string;
  topic: string;
}

// Hebrew-locale Google News queries. Each becomes one RSS request.
const FEEDS: { q: string; topic: string }[] = [
  { q: "שיווק דיגיטלי", topic: "שיווק" },
  { q: "רשתות חברתיות ניהול", topic: "סושיאל" },
  { q: "בינה מלאכותית", topic: "AI" },
  { q: "OpenAI OR Anthropic OR Google AI", topic: "AI" },
];

// Always-available fallback so the ticker never looks empty (e.g. if the feed
// is unreachable). These are evergreen, on-topic prompts.
const FALLBACK: Headline[] = [
  { title: "טרנד: וידאו קצר ממשיך להוביל מעורבות ברשתות ב-2026", url: "#", source: "Postwave", topic: "סושיאל" },
  { title: "AI לכתיבת תוכן — איך לשלב בלי לאבד את הקול האישי", url: "#", source: "Postwave", topic: "AI" },
  { title: "אלגוריתם אינסטגרם מתגמל עקביות: 4-5 פוסטים בשבוע", url: "#", source: "Postwave", topic: "שיווק" },
  { title: "LinkedIn: פוסטים עם דעה מקצועית מקבלים פי 3 חשיפה", url: "#", source: "Postwave", topic: "סושיאל" },
];

async function fetchFeed(q: string, topic: string): Promise<Headline[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
      q
    )}&hl=he&gl=IL&ceid=IL:he`;
    const res = await axios.get(url, { timeout: 7000 });
    const $ = cheerio.load(res.data, { xmlMode: true });
    const items: Headline[] = [];
    $("item").each((_, el) => {
      if (items.length >= 6) return;
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim();
      const source = $(el).find("source").first().text().trim() || "Google News";
      if (title && link) items.push({ title, url: link, source, topic });
    });
    return items;
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const batches = await Promise.all(FEEDS.map((f) => fetchFeed(f.q, f.topic)));

    // Interleave topics so the ticker alternates marketing / social / AI.
    const byTopic = batches;
    const merged: Headline[] = [];
    const seen = new Set<string>();
    let added = true;
    let round = 0;
    while (added && merged.length < 20) {
      added = false;
      for (const batch of byTopic) {
        const item = batch[round];
        if (item && !seen.has(item.title)) {
          seen.add(item.title);
          merged.push(item);
          added = true;
        }
      }
      round++;
    }

    const headlines = merged.length > 0 ? merged : FALLBACK;
    return NextResponse.json({ headlines });
  } catch {
    return NextResponse.json({ headlines: FALLBACK });
  }
}
