import { NextRequest, NextResponse } from "next/server";
import { resolveCaller } from "@/lib/api-auth";
import {
  postToTikTok,
  getCreatorInfo,
  getPublishStatus,
  isTikTokConfigured,
  type TikTokPrivacy,
} from "@/lib/tiktok";

export const dynamic = "force-dynamic";

/**
 * GET  — creator info (privacy options, limits) or a publish job's status.
 * POST — publish a video or photo post.
 *
 * Publishing posts publicly on the user's behalf, so this route always
 * requires an authenticated caller.
 */

export async function GET(req: NextRequest) {
  const caller = await resolveCaller(req);
  if (!caller.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isTikTokConfigured()) {
    return NextResponse.json({
      configured: false,
      message: "TikTok אינו מחובר. הגדר TIKTOK_ACCESS_TOKEN כדי להפעיל פרסום.",
    });
  }

  const publishId = req.nextUrl.searchParams.get("publishId");
  if (publishId) {
    const status = await getPublishStatus(publishId);
    return NextResponse.json({ configured: true, ...status });
  }

  const info = await getCreatorInfo();
  if (!info.ok) {
    return NextResponse.json({ configured: true, error: info.error }, { status: 502 });
  }
  return NextResponse.json({ configured: true, creator: info.info });
}

export async function POST(req: NextRequest) {
  const caller = await resolveCaller(req);
  if (!caller.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const caption = typeof body.caption === "string" ? body.caption : "";
  const videoUrl = typeof body.videoUrl === "string" ? body.videoUrl : undefined;
  const imageUrls = Array.isArray(body.imageUrls)
    ? body.imageUrls.filter((u: unknown) => typeof u === "string")
    : [];
  // Default to a draft: a direct post needs an audited TikTok app, and
  // silently failing a "publish" is worse than landing it in the inbox.
  const draft = body.draft !== false;
  const privacy = body.privacy as TikTokPrivacy | undefined;

  if (!caption.trim()) {
    return NextResponse.json({ error: "חסר טקסט לפוסט" }, { status: 400 });
  }

  // A direct post must use a privacy level the creator is actually offered.
  if (!draft && privacy) {
    const info = await getCreatorInfo();
    if (info.ok && !info.info.privacyOptions.includes(privacy)) {
      return NextResponse.json(
        {
          error: `TikTok לא מאפשר את רמת הפרטיות ${privacy} למשתמש הזה.`,
          allowed: info.info.privacyOptions,
        },
        { status: 400 }
      );
    }
  }

  const result = await postToTikTok({ caption, videoUrl, imageUrls, draft, privacy });

  if (!result.ok) {
    return NextResponse.json(
      { success: false, configured: !result.notConfigured, error: result.error },
      { status: result.notConfigured ? 200 : 502 }
    );
  }

  return NextResponse.json({
    success: true,
    publishId: result.publishId,
    draft,
    message: draft
      ? "נשלח לתיבת הטיוטות בטיקטוק — אפשר לסיים ולפרסם מהאפליקציה."
      : "נשלח לפרסום בטיקטוק. הפרסום מעובד ברקע.",
  });
}
