import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAccess } from "@/lib/auth";
import { enforceRateLimit, requestTooLarge } from "@/lib/rate-limit";

async function requireAdmin() {
  const access = await getCurrentAccess();
  if (!access || !access.isAdmin || access.accessStatus !== "active") return null;
  return access;
}

export async function GET() {
  const access = await requireAdmin();
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const admin = createAdminClient();
    const [profiles, organizations, clients, requests, logs] = await Promise.all([
      admin.from("profiles").select("id,email,full_name,platform_role,access_status,created_at").order("created_at", { ascending: false }).limit(200),
      admin.from("organizations").select("id,name,slug,organization_type,status,owner_user_id,created_at").order("created_at", { ascending: false }).limit(100),
      admin.from("clients").select("id,organization_id,name,website_url,business_type,status,created_at").order("created_at", { ascending: false }).limit(200),
      admin.from("privacy_requests").select("id,requester_email,request_type,status,created_at").order("created_at", { ascending: false }).limit(100),
      admin.from("audit_logs").select("id,action,entity_type,entity_id,actor_user_id,created_at").order("created_at", { ascending: false }).limit(100),
    ]);
    const error = profiles.error || organizations.error || clients.error || requests.error || logs.error;
    if (error) throw error;
    return NextResponse.json({
      profiles: profiles.data || [],
      organizations: organizations.data || [],
      clients: clients.data || [],
      privacyRequests: requests.data || [],
      auditLogs: logs.data || [],
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Admin data is unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const access = await requireAdmin();
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (requestTooLarge(request, 20_000)) return NextResponse.json({ error: "Request too large" }, { status: 413 });
  const rate = enforceRateLimit(request, "admin-write", 30, 10 * 60 * 1000);
  if (!rate.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = await request.json().catch(() => null) as Record<string, string> | null;
  if (!body?.action) return NextResponse.json({ error: "Missing action" }, { status: 400 });

  try {
    const admin = createAdminClient();
    let result: unknown = null;

    if (body.action === "invite-user") {
      const email = (body.email || "").trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
      const invited = await admin.auth.admin.inviteUserByEmail(email, { data: { full_name: body.fullName || "" } });
      if (invited.error) throw invited.error;
      await admin.from("profiles").upsert({ id: invited.data.user.id, email, full_name: body.fullName || "", access_status: "active", platform_role: "user" });
      result = { id: invited.data.user.id, email };
    } else if (body.action === "set-user-status") {
      if (!body.userId || !["pending", "active", "suspended", "revoked"].includes(body.status || "")) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      const updated = await admin.from("profiles").update({ access_status: body.status, updated_at: new Date().toISOString() }).eq("id", body.userId).select().single();
      if (updated.error) throw updated.error;
      result = updated.data;
    } else if (body.action === "create-organization") {
      const name = (body.name || "").trim();
      const slug = (body.slug || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
      if (!name || !slug || !body.ownerUserId) return NextResponse.json({ error: "Missing organization fields" }, { status: 400 });
      const created = await admin.from("organizations").insert({ name, slug, organization_type: body.organizationType || "agency", owner_user_id: body.ownerUserId }).select().single();
      if (created.error) throw created.error;
      await admin.from("organization_members").insert({ organization_id: created.data.id, user_id: body.ownerUserId, role: "owner", status: "active" });
      result = created.data;
    } else if (body.action === "create-client") {
      if (!body.organizationId || !body.name) return NextResponse.json({ error: "Missing client fields" }, { status: 400 });
      const created = await admin.from("clients").insert({ organization_id: body.organizationId, name: body.name.trim(), website_url: body.websiteUrl || null, business_type: body.businessType || null, contact_name: body.contactName || null, contact_email: body.contactEmail || null, created_by: access.id }).select().single();
      if (created.error) throw created.error;
      result = created.data;
    } else if (body.action === "set-privacy-status") {
      if (!body.requestId || !["received", "verifying", "processing", "completed", "rejected"].includes(body.status || "")) return NextResponse.json({ error: "Invalid request status" }, { status: 400 });
      const updated = await admin.from("privacy_requests").update({ status: body.status, handled_by: access.id, completed_at: body.status === "completed" ? new Date().toISOString() : null }).eq("id", body.requestId).select().single();
      if (updated.error) throw updated.error;
      result = updated.data;
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    await admin.from("audit_logs").insert({ actor_user_id: access.id, action: body.action, entity_type: body.action.split("-").slice(1).join("-") || "admin", entity_id: typeof result === "object" && result && "id" in result ? String((result as { id: unknown }).id) : null });
    return NextResponse.json({ ok: true, result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Admin action failed" }, { status: 500 });
  }
}
