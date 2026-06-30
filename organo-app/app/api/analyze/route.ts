import { NextRequest, NextResponse } from "next/server";
import { analyzeWebsite } from "@/lib/analyzer";
import { saveScan } from "@/lib/supabase";
import { enforceRateLimit, requestTooLarge } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const rate = enforceRateLimit(request, "analyze", 8, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "בוצעו יותר מדי סריקות בזמן קצר. נסה שוב בעוד מספר דקות." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter), "Cache-Control": "no-store" } },
    );
  }

  if (requestTooLarge(request)) {
    return NextResponse.json({ error: "הבקשה גדולה מדי" }, { status: 413, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const body = await request.json();
    const url = typeof body.url === "string" ? body.url.slice(0, 2048) : "";
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 80) : "anonymous";
    const result = await Promise.race([
      analyzeWebsite(url),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("הסריקה ארכה זמן רב מדי. נסה שוב או בדוק עמוד פנימי אחר באתר.")), 27_000)),
    ]);
    const persisted = await saveScan(sessionId, result);
    return NextResponse.json(
      { ...result, persisted },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-RateLimit-Remaining": String(rate.remaining),
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "אירעה שגיאה בניתוח האתר";
    return NextResponse.json({ error: message }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
