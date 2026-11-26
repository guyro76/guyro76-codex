import { NextRequest, NextResponse } from "next/server";
import { searchPlaces, isRateLimit } from "@/lib/weather";

export const dynamic = "force-dynamic";

/** City search for the manual location picker. */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (q.length < 2) {
    return NextResponse.json({ ok: true, places: [] });
  }

  try {
    const places = await searchPlaces(q, 6);
    return NextResponse.json(
      { ok: true, places },
      { headers: { "Cache-Control": "public, max-age=3600" } }
    );
  } catch (error) {
    if (isRateLimit(error)) {
      return NextResponse.json({
        ok: false,
        rateLimited: true,
        places: [],
        error: "החיפוש עמוס כרגע. נסה שוב בעוד כמה דקות.",
      });
    }
    const message = error instanceof Error ? error.message : "search failed";
    return NextResponse.json({ ok: false, places: [], error: message }, { status: 502 });
  }
}
