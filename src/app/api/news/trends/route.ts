import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

// Live trend feed for the Trends page. Pulls real Google News headlines across
// every topic a social content creator cares about, tags each by category, and
// returns a merged, de-duplicated list. Dynamic so the "refresh" button always
// gets fresh results.

export const dynamic = "force-dynamic";

interface Trend {
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string;
  publishedAt?: string;
}

// Category → Google News query. Covers AI, AI companies, social trends, the big
// platforms, digital marketing and social management.
const CATEGORIES: { q: string; category: string }[] = [
  { q: "בינה מלאכותית חדשות", category: "בינה מלאכותית" },
  { q: "OpenAI OR Anthropic OR Google Gemini OR Microsoft AI", category: "חברות AI" },
  { q: "טרנדים רשתות חברתיות", category: "טרנדים" },
  { q: "אינסטגרם עדכון Instagram", category: "אינסטגרם" },
  { q: "טיקטוק TikTok", category: "טיקטוק" },
  { q: "פייסבוק מטא Meta", category: "פייסבוק" },
  { q: "שיווק דיגיטלי", category: "שיווק דיגיטלי" },
  { q: "ניהול סושיאל מדיה", category: "ניהול סושיאל" },
];

async function fetchCategory(q: string, category: string): Promise<Trend[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
      q
    )}&hl=he&gl=IL&ceid=IL:he`;
    const res = await axios.get(url, { timeout: 7000 });
    const $ = cheerio.load(res.data, { xmlMode: true });
    const items: Trend[] = [];
    $("item").each((_, el) => {
      if (items.length >= 4) return;
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim();
      const source =
        $(el).find("source").first().text().trim() || "Google News";
      const desc = $(el)
        .find("description")
        .first()
        .text()
        .replace(/<[^>]*>/g, "")
        .trim();
      const pub = $(el).find("pubDate").first().text().trim();
      if (title && link) {
        items.push({
          title,
          summary: desc.substring(0, 160),
          url: link,
          source,
          category,
          publishedAt: pub || undefined,
        });
      }
    });
    return items;
  } catch {
    return [];
  }
}

// Evergreen fallback so the page is never empty when the feed is unreachable.
const FALLBACK: Trend[] = [
  { title: "מודלים חדשים של בינה מלאכותית מאיצים יצירת תוכן ויזואלי", summary: "כלים גנרטיביים משנים את שרשרת הפקת התוכן.", url: "#", source: "Postwave", category: "בינה מלאכותית" },
  { title: "וידאו קצר ממשיך להוביל מעורבות באינסטגרם ובטיקטוק", summary: "Reels ו-Shorts מקבלים את החשיפה הגבוהה ביותר.", url: "#", source: "Postwave", category: "טרנדים" },
  { title: "LinkedIn מתגמל פוסטים עם דעה מקצועית ועקביות", summary: "פרסום קבוע מגדיל את הטווח האורגני.", url: "#", source: "Postwave", category: "ניהול סושיאל" },
  { title: "אסטרטגיות שיווק דיגיטלי מבוססות AI ל-2026", summary: "פרסונליזציה ואוטומציה בלב הקמפיינים.", url: "#", source: "Postwave", category: "שיווק דיגיטלי" },
];

export async function GET() {
  try {
    const batches = await Promise.all(
      CATEGORIES.map((c) => fetchCategory(c.q, c.category))
    );

    // Interleave categories so the feed alternates topics instead of clustering.
    const merged: Trend[] = [];
    const seen = new Set<string>();
    let round = 0;
    let added = true;
    while (added && merged.length < 28) {
      added = false;
      for (const batch of batches) {
        const item = batch[round];
        if (item && !seen.has(item.title)) {
          seen.add(item.title);
          merged.push(item);
          added = true;
        }
      }
      round++;
    }

    const trends = merged.length > 0 ? merged : FALLBACK;
    return NextResponse.json(
      { trends, updatedAt: Date.now() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ trends: FALLBACK, updatedAt: Date.now() });
  }
}
