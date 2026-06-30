import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json({
      app: "ready",
      supabase: { configured: false, connected: false, tableReady: false },
    }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error, count } = await supabase
      .from("scans")
      .select("id", { count: "exact", head: true });

    return NextResponse.json({
      app: "ready",
      supabase: {
        configured: true,
        connected: !error,
        tableReady: !error,
        rows: count ?? 0,
        errorCode: error?.code ?? null,
        errorMessage: error ? "Supabase מוגדר, אך טבלת scans עדיין אינה מוכנה." : null,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({
      app: "ready",
      supabase: {
        configured: true,
        connected: false,
        tableReady: false,
        errorMessage: "החיבור ל-Supabase נכשל.",
      },
    }, { headers: { "Cache-Control": "no-store" } });
  }
}
