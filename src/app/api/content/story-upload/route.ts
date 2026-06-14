import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      platform,
      videoUrl,
      duration = 15,
      text,
      design,
    } = body;

    if (!platform || !videoUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (platform === "linkedin") {
      return NextResponse.json(
        { error: "Stories not supported on LinkedIn" },
        { status: 400 }
      );
    }

    const storyData = {
      id: `story_${Date.now()}`,
      platform,
      videoUrl,
      duration,
      text: text || "",
      design,
      createdAt: new Date().toISOString(),
      status: "ready",
      dimensions: {
        width: 1080,
        height: 1920,
        ratio: "9:16",
      },
    };

    return NextResponse.json({
      success: true,
      story: storyData,
      uploadUrl: `https://storage.example.com/stories/${storyData.id}`,
      message: `סטורי מוכן להעלאה ל-${platform}`,
    });
  } catch (error) {
    console.error("Story upload error:", error);
    return NextResponse.json(
      { error: "Failed to process story" },
      { status: 500 }
    );
  }
}
