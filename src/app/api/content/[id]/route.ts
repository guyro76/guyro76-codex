import { NextRequest, NextResponse } from "next/server";
import { resolveCaller } from "@/lib/api-auth";
import {
  getContent,
  deleteContent,
  isContentDbConfigured,
} from "@/lib/content-repo";

export const dynamic = "force-dynamic";

/** A single piece: fetch it, or delete it. Always scoped to the owner. */

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/content/[id]">
) {
  const caller = await resolveCaller(req);
  if (!caller.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isContentDbConfigured()) {
    return NextResponse.json({ configured: false, item: null });
  }

  const { id } = await ctx.params;
  try {
    const item = await getContent(caller.id, id);
    if (!item) {
      return NextResponse.json({ configured: true, item: null }, { status: 404 });
    }
    return NextResponse.json({ configured: true, item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: RouteContext<"/api/content/[id]">
) {
  const caller = await resolveCaller(req);
  if (!caller.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isContentDbConfigured()) {
    return NextResponse.json({ configured: false, deleted: false });
  }

  const { id } = await ctx.params;
  try {
    const deleted = await deleteContent(caller.id, id);
    return NextResponse.json({ configured: true, deleted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "delete failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
