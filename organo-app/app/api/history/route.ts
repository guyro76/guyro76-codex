import { NextRequest, NextResponse } from "next/server";
import { loadHistory } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId")?.slice(0, 80) ?? "";
  if (!sessionId) return NextResponse.json({ items: [] });
  const items = await loadHistory(sessionId);
  return NextResponse.json({ items });
}
