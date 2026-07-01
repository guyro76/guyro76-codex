import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit, requestTooLarge } from "@/lib/rate-limit";
import { assertPublicUrl, normalizeUrl, safeFetch } from "@/lib/security";

export const runtime = "nodejs";
export const maxDuration = 30;

type ScreenshotAudit = {
  details?: {
    data?: string;
  };
};

type MetricAudit = {
  displayValue?: string;
  numericValue?: number;
};

type PageSpeedPayload = {
  id?: string;
  lighthouseResult?: {
    finalUrl?: string;
    fetchTime?: string;
    audits?: Record<string, ScreenshotAudit & MetricAudit>;
    runtimeError?: { message?: string };
  };
  error?: { message?: string };
};

async function getLighthousePreview(target: URL) {
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", target.toString());
  endpoint.searchParams.append("category", "performance");
  endpoint.searchParams.set("strategy", "mobile");
  endpoint.searchParams.set("locale", "he");
  const apiKey = process.env.PAGESPEED_API_KEY?.trim();
  if (apiKey) endpoint.searchParams.set("key", apiKey);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 24_000);
  try {
    const response = await fetch(endpoint, { signal: controller.signal, cache: "no-store" });
    const payload = await response.json() as PageSpeedPayload;
    if (!response.ok || payload.error?.message || payload.lighthouseResult?.runtimeError?.message) return null;
    const lighthouse = payload.lighthouseResult;
    const audits = lighthouse?.audits ?? {};
    const screenshot = audits["final-screenshot"]?.details?.data;
    return {
      screenshot: typeof screenshot === "string" && screenshot.startsWith("data:image/") ? screenshot : "",
      finalUrl: lighthouse?.finalUrl || payload.id || target.toString(),
      fetchTime: lighthouse?.fetchTime || new Date().toISOString(),
      metrics: {
        lcp: audits["largest-contentful-paint"]?.displayValue || "לא זמין",
        cls: audits["cumulative-layout-shift"]?.displayValue || "לא זמין",
        tbt: audits["total-blocking-time"]?.displayValue || "לא זמין",
      },
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function getFallbackScreenshot(target: URL) {
  const endpoint = `https://image.thum.io/get/width/1200/crop/900/noanimate/${target.toString()}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(endpoint, {
      signal: controller.signal,
      cache: "no-store",
      headers: { accept: "image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8" },
    });
    if (!response.ok) return "";
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) return "";
    const bytes = await response.arrayBuffer();
    if (!bytes.byteLength || bytes.byteLength > 5_500_000) return "";
    return `data:${contentType};base64,${Buffer.from(bytes).toString("base64")}`;
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: NextRequest) {
  const rate = enforceRateLimit(request, "monitor", 12, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "בוצעו יותר מדי בדיקות מוניטור בזמן קצר. נסה שוב בעוד מספר דקות." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter), "Cache-Control": "no-store" } },
    );
  }
  if (requestTooLarge(request, 20_000)) {
    return NextResponse.json({ error: "הבקשה גדולה מדי" }, { status: 413, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const body = await request.json() as { url?: unknown };
    const target = normalizeUrl(typeof body.url === "string" ? body.url.slice(0, 2048) : "");
    await assertPublicUrl(target);

    const startedAt = Date.now();
    const [pageOutcome, preview] = await Promise.all([
      safeFetch(target, {
        timeoutMs: 9_000,
        maxBytes: 650_000,
        accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        allowReaderFallback: false,
      }).then((page) => ({ ok: true as const, page })).catch((error: unknown) => ({ ok: false as const, error })),
      getLighthousePreview(target),
    ]);

    let title = "";
    let statusCode = 0;
    let contentType = "";
    let redirects = 0;
    let responseSource = "direct";
    let responseTimeMs = Date.now() - startedAt;
    let finalUrl = preview?.finalUrl || target.toString();
    let directError = "";

    if (pageOutcome.ok) {
      const page = pageOutcome.page;
      statusCode = page.response.status;
      contentType = page.response.headers.get("content-type") || "";
      redirects = page.redirects;
      responseSource = page.source;
      finalUrl = page.finalUrl.toString();
      responseTimeMs = Date.now() - startedAt;
      if (/html|xhtml/i.test(contentType)) {
        const $ = cheerio.load(page.body);
        title = $("title").first().text().replace(/\s+/g, " ").trim();
      }
    } else {
      directError = pageOutcome.error instanceof Error ? pageOutcome.error.message : "הבדיקה הישירה נכשלה";
    }

    const lighthouseScreenshot = preview?.screenshot || "";
    const fallbackScreenshot = lighthouseScreenshot ? "" : await getFallbackScreenshot(target);
    const screenshot = lighthouseScreenshot || fallbackScreenshot;
    const isDirectlyOnline = statusCode >= 200 && statusCode < 400;
    const loadState = isDirectlyOnline ? "online" : preview ? "limited" : "offline";

    if (!screenshot) {
      return NextResponse.json({
        error: "לא ניתן היה להפיק צילום מסך תקין של האתר. נסה שוב בעוד מספר שניות.",
        requestedUrl: target.toString(),
        finalUrl,
        title: title || new URL(finalUrl).hostname,
        checkedAt: new Date().toISOString(),
        loadState,
        statusCode,
        responseTimeMs,
      }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.json({
      requestedUrl: target.toString(),
      finalUrl,
      title: title || new URL(finalUrl).hostname,
      checkedAt: new Date().toISOString(),
      loadState,
      isOnline: loadState !== "offline",
      statusCode,
      contentType,
      redirects,
      responseTimeMs,
      responseSource,
      screenshot,
      screenshotSource: lighthouseScreenshot ? "Google Lighthouse" : "צילום חיצוני מאובטח",
      screenshotCapturedAt: preview?.fetchTime || new Date().toISOString(),
      metrics: preview?.metrics || { lcp: "לא זמין", cls: "לא זמין", tbt: "לא זמין" },
      note: isDirectlyOnline
        ? "האתר נטען בהצלחה בבדיקה ישירה."
        : preview
          ? `האתר נטען באמצעות דפדפן Lighthouse, אך הבדיקה הישירה הוגבלה${directError ? `: ${directError}` : "."}`
          : `לא ניתן היה לאמת טעינה של האתר${directError ? `: ${directError}` : "."}`,
    }, {
      headers: {
        "Cache-Control": "no-store",
        "X-RateLimit-Remaining": String(rate.remaining),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "בדיקת המוניטור נכשלה";
    return NextResponse.json({ error: message }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
