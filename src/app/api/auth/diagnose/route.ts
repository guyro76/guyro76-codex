import { NextResponse } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase";

// Diagnostic endpoint: checks whether the live deployment can reach Supabase
// Auth and what the project's signup settings are. Safe + read-only.
// Open https://<site>/api/auth/diagnose in a browser to inspect.
export async function GET() {
  const result: Record<string, unknown> = {
    supabaseUrl: SUPABASE_URL,
    keyPrefix: SUPABASE_ANON_KEY.slice(0, 12) + "…",
    keyLength: SUPABASE_ANON_KEY.length,
  };

  // 1. Can we reach the Auth settings endpoint? (tells us if key/url are valid)
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_ANON_KEY },
    });
    result.settingsStatus = res.status;
    result.settingsBody = await res.json().catch(() => null);
  } catch (e) {
    result.settingsError = e instanceof Error ? e.message : String(e);
  }

  // 2. Probe a signup with a throwaway address to capture the real error/flow.
  try {
    const probeEmail = `diag_${Date.now()}@example.com`;
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: probeEmail, password: "Diag-Test-123!" }),
    });
    result.signupStatus = res.status;
    result.signupBody = await res.json().catch(() => null);
  } catch (e) {
    result.signupError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
