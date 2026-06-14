import { NextResponse } from "next/server";
import { getDailyTip, getRandomTip } from "@/lib/daily-tips";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const random = searchParams.get("random") === "true";

  const tip = random ? getRandomTip() : getDailyTip();

  return NextResponse.json({
    success: true,
    tip,
    message: "טיפ יומי לבניית סמכות",
    timestamp: new Date().toISOString(),
  });
}
