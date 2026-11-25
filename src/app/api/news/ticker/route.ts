import { NextResponse } from "next/server";
import { fetchHeadlines, CATEGORIES } from "@/lib/news-feeds";

/** Headlines for the header ticker — short list, mixed topics. */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // A subset: the ticker is a glance, not a feed.
    const cats = CATEGORIES.filter((c) =>
      ["AI", "שיווק", "סושיאל", "טרנדים"].includes(c.topic)
    );
    const headlines = await fetchHeadlines({
      categories: cats,
      perCategory: 5,
      limit: 20,
      cacheKey: "ticker",
    });

    return NextResponse.json(
      { headlines, updatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "public, max-age=120" } }
    );
  } catch {
    return NextResponse.json({ headlines: [], updatedAt: null });
  }
}
