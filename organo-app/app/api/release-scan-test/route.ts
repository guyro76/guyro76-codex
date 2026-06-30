import { NextResponse } from "next/server";
import { runResilientAnalysis } from "@/lib/resilient-analysis";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET() {
  const targets = [
    ["dorihome", "https://dorihome.co.il/"],
    ["leos", "https://www.leos.co.il/"],
  ] as const;

  const results = await Promise.all(targets.map(async ([name, url]) => {
    try {
      const result = await runResilientAnalysis(url);
      return {
        name,
        ok: true,
        source: result.response.source,
        limited: result.response.limited,
        score: result.scores.overall,
        checks: result.checks.length,
        title: result.snapshot.title,
      };
    } catch (error) {
      return { name, ok: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }));

  return NextResponse.json({ pass: results.every((item) => item.ok), results }, {
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}
