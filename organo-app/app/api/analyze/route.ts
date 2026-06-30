import { NextRequest, NextResponse } from "next/server";
import { analyzeWebsite } from "@/lib/analyzer";
import { saveScan } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = typeof body.url === "string" ? body.url : "";
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 80) : "anonymous";
    const result = await analyzeWebsite(url);
    const persisted = await saveScan(sessionId, result);
    return NextResponse.json({ ...result, persisted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "אירעה שגיאה בניתוח האתר";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
