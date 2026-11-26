import { NextRequest, NextResponse } from "next/server";
import { getWeather, reverseName, isRateLimit } from "@/lib/weather";

export const dynamic = "force-dynamic";

/**
 * Current conditions for a coordinate, plus a human name for the place.
 *
 * Unauthenticated on purpose: it reveals nothing about the user, takes only a
 * coordinate the browser already knows, and the widget renders before sign-in.
 */
export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lon = Number(req.nextUrl.searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "חסרות קואורדינטות" }, { status: 400 });
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: "קואורדינטות לא תקינות" }, { status: 400 });
  }

  try {
    // The name is a nicety — a failure there must not cost us the weather.
    const [weather, name] = await Promise.all([
      getWeather(lat, lon),
      reverseName(lat, lon).catch(() => null),
    ]);

    return NextResponse.json(
      { ok: true, weather, place: name },
      { headers: { "Cache-Control": "public, max-age=300" } }
    );
  } catch (error) {
    if (isRateLimit(error)) {
      return NextResponse.json(
        {
          ok: false,
          rateLimited: true,
          error: "שירות מזג האוויר עמוס כרגע. ננסה שוב בעוד כמה דקות.",
        },
        { status: 200 }
      );
    }
    const message = error instanceof Error ? error.message : "weather failed";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
