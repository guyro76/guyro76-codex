import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "אורגנו - SEO, GEO ו-AEO במקום אחד",
  description: "כלי לניתוח אתרים, שיפור קידום אורגני והכנת תוכן למנועי חיפוש ומנועי תשובות מבוססי AI.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "אורגנו - מערכת צמיחה אורגנית חכמה",
    description: "ניתוח SEO, GEO ו-AEO עם המלצות ותוכן מוכן ליישום.",
    type: "website",
    locale: "he_IL",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
