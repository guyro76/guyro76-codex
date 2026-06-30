import { NextResponse } from "next/server";
import { runResilientAnalysis } from "@/lib/resilient-analysis";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET() {
  try {
    const result = await runResilientAnalysis("https://dorihome.co.il/");
    return NextResponse.json({ ok: true, finalUrl: result.finalUrl, title: result.snapshot.title, source: result.response.source, limited: result.response.limited, status: result.response.status, scores: result.scores, checks: result.checks.length }, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
  }
}
