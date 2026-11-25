import type { Metadata, Viewport } from "next";
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
  title: "Postwave - צור, נהל ופרסם תוכן סושיאל",
  description:
    "פלטפורמה מקיפה ליצירה, ניהול ופרסום של תוכן שיווקי וסושיאל בכל הרשתות החברתיות",
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
    url: "https://guyro76-codex.vercel.app",
    title: "Postwave - צור, נהל ופרסם תוכן סושיאל",
    description:
      "פלטפורמה מקיפה ליצירה, ניהול ופרסום של תוכן שיווקי וסושיאל",
    siteName: "Postwave",
  },
};

/* theme-color is matched to the canvas in each scheme so the browser chrome
   blends into the page instead of showing a seam at the top edge. */
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8fe" },
    { media: "(prefers-color-scheme: dark)", color: "#16131f" },
  ],
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
      {/* No background/colour utilities here — the canvas, ink and glass all
          come from the dynamic hue system in globals.css. */}
      <body className="min-h-full flex flex-col">
        <header className="glass sticky top-0 z-50 !rounded-none border-x-0 border-t-0 px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-bold"
          >
            <span aria-hidden="true">🌊</span>
            <span>
              Post<span className="text-gradient">wave</span>
            </span>
          </Link>
        </header>
        <Providers>{children}</Providers>
        <Footer />
      </body>
    </html>
  );
}
