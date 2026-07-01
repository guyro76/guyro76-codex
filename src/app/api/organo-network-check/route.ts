import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://polhdnfjvvlgszsnnuor.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_htSlaRn-yAVKanGxXr8Ywg_-hnCajMA";

function describe(error: unknown) {
  const value = error as { name?: string; cause?: { code?: string; syscall?: string } };
  return { name: value?.name || "Error", code: value?.cause?.code || "network_error", syscall: value?.cause?.syscall || null };
}

export async function GET() {
  try {
    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    return NextResponse.json({ reachable: true, status: response.status, ok: response.ok }, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
  } catch (error) {
    return NextResponse.json({ reachable: false, error: describe(error) }, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
  }
}
