import { NextResponse } from "next/server";
import { isSupabaseAuthConfigured, supabaseServiceKey } from "@/lib/supabase/env";

export async function GET() {
  const authentication = isSupabaseAuthConfigured();
  const database = Boolean(supabaseServiceKey());
  const ready = authentication && database;
  return NextResponse.json(
    { status: ready ? "ready" : "not_ready", checks: { application: true, authentication, database } },
    { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}
