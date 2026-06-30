import { NextRequest, NextResponse } from "next/server";
import { loadHistory } from "@/lib/supabase";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const rate = enforceRateLimit(request, "history", 60, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "יותר מדי בקשות" }, { status: 429, headers: { "Retry-After": String(rate.retryAfter), "Cache-Control": "no-store" } });
  }
  const sessionId = request.nextUrl.searchParams.get("sessionId")?.slice(0, 80) ?? "";
  if (!sessionId) return NextResponse.json({ items: [] }, { headers: { "Cache-Control": "no-store" } });
  const items = await loadHistory(sessionId);
  return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store", "X-RateLimit-Remaining": String(rate.remaining) } });
}
