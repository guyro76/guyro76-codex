import { NextRequest, NextResponse } from "next/server";
import { getDailyTip } from "@/lib/daily-tips";
import { sendEmailReminder, logReminderAttempt } from "@/lib/reminders";

export async function GET(req: NextRequest) {
  try {
    const tip = getDailyTip();

    try {
      await sendEmailReminder(tip);
      await logReminderAttempt({
        channel: "email",
        tipId: tip.id,
        status: "success",
      });

      return NextResponse.json({
        success: true,
        message: `Email reminder sent (Tip #${tip.id}: ${tip.title})`,
        tip,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      await logReminderAttempt({
        channel: "email",
        tipId: tip.id,
        status: "failed",
        error: errorMsg,
      });

      return NextResponse.json(
        {
          success: false,
          error: errorMsg,
          tip,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    await logReminderAttempt({
      channel: "email",
      status: "failed",
      error: errorMsg,
    });

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
