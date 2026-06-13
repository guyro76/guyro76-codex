import type { Metadata } from "next";
import { Rubik, Heebo, Assistant } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Footer } from "./footer";
import Link from "next/link";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "hebrew"],
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin", "hebrew"],
});

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["latin", "hebrew"],
});

export const metadata: Metadata = {
  title: "AuthorityBoost AI - בנה סמכות דיגיטלית",
  description:
    "פלטפורמה מקיפה לבניית סמכות דיגיטלית, שיווק תוכן בתוך רשתות חברתיות והנהלת נוכחות מקצועית",
  keywords: [
    "סמכות דיגיטלית",
    "שיווק תוכן",
    "ניהול סושיאל",
    "AI content",
    "personal branding",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  authors: [{ name: "Giy Rozenberg" }],
  creator: "Giy Rozenberg",
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: "https://authorityboost.ai",
    title: "AuthorityBoost AI - בנה סמכות דיגיטלית",
    description:
      "פלטפורמה מקיפה לבניית סמכות דיגיטלית וניהול נוכחות מקצועית",
    siteName: "AuthorityBoost AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      suppressHydrationWarning
      className={`${rubik.variable} ${heebo.variable} ${assistant.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-white">
        <header className="border-b border-slate-800 bg-slate-900/50 px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-bold hover:text-cyan-400 transition-colors"
          >
            🏠 <span>AuthorityBoost</span>
          </Link>
        </header>
        <Providers>{children}</Providers>
        <Footer />
      </body>
    </html>
  );
}
