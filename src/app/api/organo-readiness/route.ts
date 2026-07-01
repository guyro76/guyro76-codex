import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://polhdnfjvvlgszsnnuor.supabase.co";

const SUPABASE_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_htSlaRn-yAVKanGxXr8Ywg_-hnCajMA";

async function checkTable(table: string, key: string) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${encodeURIComponent(table)}?select=*&limit=0`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        cache: "no-store",
      }
    );

    const body = await response.text();
    return {
      reachable: response.status !== 404,
      ready: response.ok || response.status === 401 || response.status === 403,
      status: response.status,
      code: body.includes("PGRST205") ? "table_missing" : null,
    };
  } catch {
    return { reachable: false, ready: false, status: 0, code: "network_error" };
  }
}

export async function GET() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    "";

  let authSettings = {
    reachable: false,
    emailEnabled: false,
    googleEnabled: false,
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_PUBLIC_KEY },
      cache: "no-store",
    });
    const data = response.ok ? await response.json() : {};
    const providers = data?.external || data?.external_providers || {};
    authSettings = {
      reachable: response.ok,
      emailEnabled: Boolean(data?.disable_signup === false || data?.mailer_autoconfirm !== undefined),
      googleEnabled: Boolean(providers?.google || data?.external?.google),
    };
  } catch {
    // Fail closed and report only non-sensitive state.
  }

  const probeKey = serviceKey || SUPABASE_PUBLIC_KEY;
  const [profiles, organizations, scans, clients, privacyRequests] =
    await Promise.all([
      checkTable("profiles", probeKey),
      checkTable("organizations", probeKey),
      checkTable("scans", probeKey),
      checkTable("clients", probeKey),
      checkTable("privacy_requests", probeKey),
    ]);

  const requiredTablesReady = [
    profiles,
    organizations,
    scans,
    clients,
    privacyRequests,
  ].every((item) => item.ready && item.code !== "table_missing");

  const result = {
    app: "organo",
    checkedAt: new Date().toISOString(),
    vercel: {
      production: process.env.VERCEL_ENV === "production",
      environment: process.env.VERCEL_ENV || "unknown",
    },
    auth: {
      supabaseReachable: authSettings.reachable,
      emailEnabled: authSettings.emailEnabled,
      googleEnabled: authSettings.googleEnabled,
      publicKeyConfigured: Boolean(SUPABASE_PUBLIC_KEY),
      serviceKeyConfigured: Boolean(serviceKey),
      nextAuthSecretConfigured: Boolean(process.env.NEXTAUTH_SECRET),
      googleCredentialsConfigured: Boolean(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ),
    },
    database: {
      ready: requiredTablesReady,
      tables: { profiles, organizations, scans, clients, privacyRequests },
    },
    commerciallyReady:
      authSettings.reachable &&
      Boolean(serviceKey) &&
      requiredTablesReady &&
      Boolean(process.env.NEXTAUTH_SECRET),
  };

  return NextResponse.json(result, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
