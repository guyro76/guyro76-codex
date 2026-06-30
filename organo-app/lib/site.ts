export const siteName = "אורגנו";
export const siteDescription = "מערכת לניתוח SEO, GEO ו-AEO, איתור חסמים טכניים ויצירת המלצות ותוכן מוכן ליישום.";
export const contactEmail = "guyro76@gmail.com";

export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
