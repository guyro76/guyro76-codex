import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAccess } from "@/lib/auth";
import { enforceRateLimit, requestTooLarge } from "@/lib/rate-limit";

const allowedStatuses = new Set(["pending", "active", "suspended", "revoked"]);

export async function POST(request: NextRequest) {
  const access = await getCurrentAccess();
  if (!access?.isAdmin || access.accessStatus !== "active") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (requestTooLarge(request, 8_000)) return NextResponse.json({ error: "Request too large" }, { status: 413 });
  const rate = enforceRateLimit(request, "admin-user-status", 30, 10 * 60 * 1000);
  if (!rate.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json().catch(() => null) as { userId?: string; status?: string } | null;
  if (!body?.userId || !body.status || !allowedStatuses.has(body.status)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const admin = createAdminClient();
  try {
    const { data: target, error: targetError } = await admin.from("profiles").select("email").eq("id", body.userId).single();
    if (targetError) throw targetError;
    if (target.email.toLowerCase() === "guyro76@gmail.com") return NextResponse.json({ error: "System owner cannot be suspended" }, { status: 400 });

    const { data: updated, error: updateError } = await admin.from("profiles").update({ access_status: body.status, updated_at: new Date().toISOString() }).eq("id", body.userId).select().single();
    if (updateError) throw updateError;

    if (body.status === "suspended" || body.status === "revoked") {
      const { error } = await admin.auth.admin.updateUserById(body.userId, { ban_duration: "876000h" });
      if (error) throw error;
    } else if (body.status === "active") {
      const { error } = await admin.auth.admin.updateUserById(body.userId, { ban_duration: "none" });
      if (error) throw error;
    }

    await admin.from("audit_logs").insert({ actor_user_id: access.id, action: "set-user-status", entity_type: "user", entity_id: body.userId, metadata: { status: body.status } });
    return NextResponse.json({ ok: true, user: updated }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "User status update failed" }, { status: 500 });
  }
}
