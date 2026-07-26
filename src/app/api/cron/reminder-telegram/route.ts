import { NextRequest, NextResponse } from "next/server";
import { getDailyTip } from "@/lib/daily-tips";
import { sendTelegramReminder, logReminderAttempt } from "@/lib/reminders";

export async function GET(req: NextRequest) {
  try {
    const tip = getDailyTip();

    try {
      await sendTelegramReminder(tip);
      await logReminderAttempt({
        channel: "telegram",
        tipId: tip.id,
        status: "success",
      });

      return NextResponse.json({
        success: true,
        message: `Telegram reminder sent (Tip #${tip.id}: ${tip.title})`,
        tip,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      await logReminderAttempt({
        channel: "telegram",
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
      channel: "telegram",
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
