import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      projectId,
      platforms,
      caption,
      composioApiKey,
      scheduleFor,
    } = body;

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

    // Since we're using sessionStorage for carousel data, we can't access it server-side.
    // The user must have the carousel data available from the carousel viewer.
    // For now, we'll prepare the payload and let the client handle the actual posting to Composio.

    const postPayload = {
      projectId,
      platforms,
      caption: caption || "בדוק את הקרוסלה המדהימה שלנו!",
      timestamp: new Date().toISOString(),
      scheduleFor: scheduleFor || null,
    };

    // Log the post request (in a real app, save to database)
    console.log("Social post request:", {
      user: session.user.email,
      ...postPayload,
    });

    // Return success - actual posting would happen via Composio or manual download
    return NextResponse.json({
      success: true,
      message: "בקשת הפרסום התקבלה בהצלחה",
      postPayload,
      instructions: {
        step1: "הורד את כל הקרוסלה (7 תמונות PNG)",
        step2: `פתח את Composio ובחר את הרשתות: ${platforms.join(", ")}`,
        step3: "העלה את ה-7 תמונות",
        step4: "הוסף את הטקסט: " + caption,
        step5: "לחץ על Publish כדי לפרסם",
      },
    });
  } catch (error) {
    console.error("Social post error:", error);
    return NextResponse.json(
      { error: "שגיאה בתהליך הפרסום" },
      { status: 500 }
    );
  }
}
