import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import {
  isComposioConfigured,
  postToPlatforms,
  COMPOSIO_USER_ID,
} from "@/lib/composio";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, platforms, caption, imageUrl } = body as {
      projectId?: string;
      platforms?: string[];
      caption?: string;
      imageUrl?: string;
    };

    if (!projectId) {
      return NextResponse.json(
        { error: "חובה לציין ID של קרוסלה" },
        { status: 400 }
      );
    }

    if (!platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: "בחר לפחות רשת חברתית אחת" },
        { status: 400 }
      );
    }

    const text = (caption || "").trim() || "תוכן חדש מ-Postwave";

    // If Composio isn't configured yet, return an honest "not configured"
    // response (not a fake success) so the UI can guide the user precisely.
    if (!isComposioConfigured()) {
      return NextResponse.json({
        configured: false,
        message:
          "פרסום אוטומטי עדיין לא הופעל. הוסף COMPOSIO_API_KEY במשתני הסביבה ב-Vercel כדי לפרסם בלחיצה אחת.",
        instructions: {
          step1: "היכנס ל-https://app.composio.dev ← Settings ← API Keys",
          step2: "העתק את ה-API Key",
          step3:
            "ב-Vercel: Project → Settings → Environment Variables → הוסף COMPOSIO_API_KEY",
          step4: "Redeploy, ואז כפתור הפרסום ישלח ישירות לרשתות",
        },
      });
    }

    // Real posting through Composio — one honest result per platform.
    const results = await postToPlatforms(
      platforms,
      text,
      imageUrl,
      COMPOSIO_USER_ID
    );

    const anySuccess = results.some((r) => r.successful);
    const allSuccess = results.every((r) => r.successful);

    return NextResponse.json(
      {
        configured: true,
        success: allSuccess,
        partial: anySuccess && !allSuccess,
        results,
      },
      { status: anySuccess ? 200 : 502 }
    );
  } catch (error) {
    console.error("Social post error:", error);
    return NextResponse.json(
      { error: "שגיאה בתהליך הפרסום" },
      { status: 500 }
    );
  }
}
