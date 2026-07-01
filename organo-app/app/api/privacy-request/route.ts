import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enforceRateLimit, requestTooLarge } from "@/lib/rate-limit";

const allowedTypes = new Set(["access", "correction", "deletion", "export", "objection", "other"]);

export async function POST(request: NextRequest) {
  if (requestTooLarge(request, 12_000)) return NextResponse.json({ error: "הבקשה גדולה מדי" }, { status: 413 });
  const rate = enforceRateLimit(request, "privacy-request", 5, 60 * 60 * 1000);
  if (!rate.allowed) return NextResponse.json({ error: "יותר מדי בקשות. נסה שוב מאוחר יותר." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });

  const body = await request.json().catch(() => null) as { email?: string; type?: string; details?: string; website?: string } | null;
  const email = body?.email?.trim().toLowerCase() || "";
  const type = body?.type || "";
  const details = body?.details?.trim().slice(0, 4000) || "";
  const honeypot = body?.website?.trim() || "";

  if (honeypot) return NextResponse.json({ ok: true });
  if (!/^\S+@\S+\.\S+$/.test(email) || !allowedTypes.has(type)) return NextResponse.json({ error: "פרטים לא תקינים" }, { status: 400 });

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("privacy_requests").insert({ requester_email: email, request_type: type, details });
    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "לא ניתן לשמור את הבקשה כרגע. ניתן לפנות בדוא״ל." }, { status: 503 });
  }
}
