import { DAILY_TIPS } from "@/lib/daily-tips";
import { formatTipForEmail } from "./formatters";
import { Resend } from "resend";

type DailyTip = (typeof DAILY_TIPS)[0];

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailReminder(tip: DailyTip): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "reminders@codex.local";
  const toEmail = process.env.REMINDER_EMAIL;

  if (!apiKey || !toEmail) {
    throw new Error("Missing email configuration (RESEND_API_KEY or REMINDER_EMAIL)");
  }

  const html = formatTipForEmail(tip);

  await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: `🎯 טיפ יומי: ${tip.title}`,
    html,
  });
}
