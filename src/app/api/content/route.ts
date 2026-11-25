import { NextRequest, NextResponse } from "next/server";
import { resolveCaller } from "@/lib/api-auth";
import {
  listContent,
  saveContent,
  importContent,
  isContentDbConfigured,
  type SaveInput,
} from "@/lib/content-repo";

export const dynamic = "force-dynamic";

/**
 * The content library.
 *
 * GET  — everything this caller owns, newest first.
 * POST — save one piece, or import a batch carried over from localStorage.
 *
 * Every query is scoped to the caller's own email inside the repository, so a
 * client cannot read or overwrite someone else's library by changing a field.
 */

function notConfigured() {
  return NextResponse.json(
    {
      configured: false,
      items: [],
      message:
        "אחסון בשרת אינו מוגדר. הגדר SUPABASE_SERVICE_ROLE_KEY כדי שהספרייה תסונכרן בין מכשירים.",
    },
    { status: 200 }
  );
}

export async function GET(req: NextRequest) {
  const caller = await resolveCaller(req);
  if (!caller.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isContentDbConfigured()) return notConfigured();

  try {
    const limit = Number(req.nextUrl.searchParams.get("limit") || 100);
    const items = await listContent(caller.id, limit);
    return NextResponse.json({ configured: true, items, count: items.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "list failed";
    return NextResponse.json({ configured: true, error: message }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const caller = await resolveCaller(req);
  if (!caller.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isContentDbConfigured()) return notConfigured();

  const body = await req.json().catch(() => ({}));

  try {
    // Batch import of a browser-local library.
    if (Array.isArray(body.items)) {
      const valid = (body.items as SaveInput[]).filter(
        (i) => i && typeof i.id === "string" && typeof i.topic === "string"
      );
      const imported = await importContent(caller.id, valid);
      return NextResponse.json({ configured: true, imported });
    }

    if (!body.id || !body.topic) {
      return NextResponse.json(
        { error: "חסר id או topic" },
        { status: 400 }
      );
    }

    const saved = await saveContent(caller.id, body as SaveInput);
    return NextResponse.json({ configured: true, item: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "save failed";
    return NextResponse.json({ configured: true, error: message }, { status: 502 });
  }
}
