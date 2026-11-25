import { NextResponse } from "next/server";
import { fetchHeadlines } from "@/lib/news-feeds";

/**
 * The Trends page feed: all categories, interleaved, with a timestamp so the
 * UI can show how fresh it is.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const trends = await fetchHeadlines({
      perCategory: 5,
      limit: 32,
      cacheKey: "trends",
    });

    return NextResponse.json({
      trends,
      count: trends.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "feed failed";
    return NextResponse.json(
      { trends: [], count: 0, updatedAt: null, error: message },
      { status: 200 }
    );
  }
}
