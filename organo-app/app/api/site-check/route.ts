import { NextRequest, NextResponse } from "next/server";
import { analyzeWebsite } from "@/lib/analyzer";

export const runtime = "nodejs";
export const maxDuration = 30;

const targets: Record<string, string> = {
  dori: "https://dorihome.co.il/",
  leos: "https://www.leos.co.il/",
};

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key") || "";
  const target = targets[key];
  if (!target) return NextResponse.json({ error: "Unknown site" }, { status: 400 });
  try {
    const result = await analyzeWebsite(target);
    return NextResponse.json({
      ok: true,
      key,
      finalUrl: result.finalUrl,
      title: result.snapshot.title,
      source: result.response.source,
      limited: result.response.limited,
      status: result.response.status,
      scores: result.scores,
      checks: result.checks.length,
      words: result.snapshot.wordCount,
    }, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
  } catch (error) {
    return NextResponse.json({ ok: false, key, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
