import { DAILY_TIPS } from "@/lib/daily-tips";
import { formatTipForWhatsApp } from "./formatters";
import twilio from "twilio";

type DailyTip = (typeof DAILY_TIPS)[0];

export async function sendWhatsAppReminder(tip: DailyTip): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
  const toNumber = process.env.TWILIO_WHATSAPP_TO;

  if (!accountSid || !authToken || !fromNumber || !toNumber) {
    throw new Error("Missing Twilio configuration (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, or TWILIO_WHATSAPP_TO)");
  }

  const client = twilio(accountSid, authToken);
  const message = formatTipForWhatsApp(tip);

  await client.messages.create({
    body: message,
    from: fromNumber,
    to: toNumber,
  });
}
