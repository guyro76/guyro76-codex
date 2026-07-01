import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAccess } from "@/lib/auth";
import { enforceRateLimit, requestTooLarge } from "@/lib/rate-limit";

async function requireAdmin() {
  const access = await getCurrentAccess();
  return access?.isAdmin && access.accessStatus === "active" ? access : null;
}

export async function POST(request: NextRequest) {
  const access = await requireAdmin();
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (requestTooLarge(request, 12_000)) return NextResponse.json({ error: "Request too large" }, { status: 413 });
  const rate = enforceRateLimit(request, "admin-client-data", 20, 10 * 60 * 1000);
  if (!rate.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json().catch(() => null) as { action?: string; clientId?: string; confirm?: string } | null;
  if (!body?.clientId || !body.action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const admin = createAdminClient();
  try {
    if (body.action === "export") {
      const [client, scans] = await Promise.all([
        admin.from("clients").select("*").eq("id", body.clientId).single(),
        admin.from("scans").select("*").eq("client_id", body.clientId).order("created_at", { ascending: true }),
      ]);
      if (client.error || scans.error) throw client.error || scans.error;
      await admin.from("audit_logs").insert({ actor_user_id: access.id, action: "export-client", entity_type: "client", entity_id: body.clientId });
      return NextResponse.json({ exportedAt: new Date().toISOString(), client: client.data, scans: scans.data || [] }, { headers: { "Cache-Control": "no-store", "Content-Disposition": `attachment; filename=organo-client-${body.clientId}.json` } });
    }

    if (body.action === "delete") {
      if (body.confirm !== "DELETE") return NextResponse.json({ error: "Deletion confirmation required" }, { status: 400 });
      const deleted = await admin.from("clients").delete().eq("id", body.clientId).select("id,name").single();
      if (deleted.error) throw deleted.error;
      await admin.from("audit_logs").insert({ actor_user_id: access.id, action: "delete-client", entity_type: "client", entity_id: body.clientId, metadata: { name: deleted.data.name } });
      return NextResponse.json({ ok: true, deleted: deleted.data }, { headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Client data action failed" }, { status: 500 });
  }
}
