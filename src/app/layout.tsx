import type { Metadata } from "next";
import { Rubik, Heebo, Assistant } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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
  title: "AuthorityBoost AI",
  description: "Transform knowledge into digital authority",
  icons: {
    icon: "/favicon.ico",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
