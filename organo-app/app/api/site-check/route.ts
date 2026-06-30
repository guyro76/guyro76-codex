import { NextRequest, NextResponse } from "next/server";
import { runResilientAnalysis } from "@/lib/resilient-analysis";

export const runtime = "nodejs";
export const maxDuration = 30;

const targets: Record<string, string> = {
  dori: "https://dorihome.co.il/",
  leos: "https://www.leos.co.il/",
};

async function probe(url: string, headers: Record<string, string> = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(url, { redirect: "manual", cache: "no-store", signal: controller.signal, headers });
    const body = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      location: response.headers.get("location"),
      contentType: response.headers.get("content-type"),
      server: response.headers.get("server"),
      length: body.length,
      prefix: body.slice(0, 220).replace(/\s+/g, " "),
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? `${error.name}: ${error.message}` : "Unknown error" };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key") || "";
  const target = targets[key];
  if (!target) return NextResponse.json({ error: "Unknown site" }, { status: 400 });

  const browserHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7",
  };
  const readerUrl = `https://r.jina.ai/${target}`;
  const [direct, readerDefault, readerBrowser] = await Promise.all([
    probe(target, browserHeaders),
    probe(readerUrl, { Accept: "text/plain" }),
    probe(readerUrl, { Accept: "text/html", "X-Respond-With": "html", "X-Engine": "browser", "X-No-Cache": "true", "X-Timeout": "8" }),
  ]);

  try {
    const result = await runResilientAnalysis(target);
    return NextResponse.json({
      ok: true,
      key,
      target,
      probes: { direct, readerDefault, readerBrowser },
      analysis: {
        finalUrl: result.finalUrl,
        title: result.snapshot.title,
        source: result.response.source,
        limited: result.response.limited,
        status: result.response.status,
        scores: result.scores,
        checks: result.checks.length,
        words: result.snapshot.wordCount,
      },
    }, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      key,
      target,
      probes: { direct, readerDefault, readerBrowser },
      analysisError: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
  }
}
