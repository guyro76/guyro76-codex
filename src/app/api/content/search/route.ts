import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { searchContent } from "@/lib/news";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query required" },
        { status: 400 }
      );
    }

    const results = await searchContent(query);

    if (results.length === 0) {
      return NextResponse.json({
        results: [],
        message: "לא נמצאו מקורות אינטרנט אמינים. נסה ניסוח אחר או הדבק קישור לכתבה.",
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Content search error:", error);
    return NextResponse.json(
      { error: "חיפוש התוכן נכשל כרגע. נסה שוב בעוד רגע." },
      { status: 500 }
    );
  }
}
