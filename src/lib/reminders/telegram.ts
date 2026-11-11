import { DAILY_TIPS } from "@/lib/daily-tips";
import { formatTipForTelegram } from "./formatters";

type DailyTip = (typeof DAILY_TIPS)[0];

export async function sendTelegramReminder(tip: DailyTip): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error("Missing Telegram configuration (TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID)");
  }

  const message = formatTipForTelegram(tip);
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  if (!data.ok) {
    throw new Error(`Telegram API returned error: ${data.description}`);
  }
}
