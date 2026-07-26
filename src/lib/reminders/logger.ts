export async function logReminderAttempt(data: {
  channel: string;
  tipId?: number;
  status: "success" | "failed" | "skipped";
  error?: string;
  recipient?: string;
}): Promise<void> {
  try {
    const entry = {
      timestamp: new Date().toISOString(),
      ...data,
    };

    console.log(`[Reminder] ${data.channel} | ${data.status}`, entry);

    if (process.env.NODE_ENV === "production") {
      // In production, could send to external logging service (Sentry, DataDog, etc.)
      // For now, just console.log which goes to Vercel logs
    }
  } catch (err) {
    console.error("Failed to log reminder:", err);
  }
}
