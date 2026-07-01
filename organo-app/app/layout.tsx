import type { Metadata } from "next";
import Link from "next/link";
import AppChromeClient from "@/components/AppChromeClient";
import OgiAssistant from "@/components/OgiAssistant";
import { contactEmail, siteDescription, siteName, siteUrl } from "@/lib/site";
import "./globals.css";
import "./info.css";
import "./dashboard-2026.css";
import "./app-chrome.css";
import "./monitor-global.css";
import "./ogi.css";
import "./ogi-blue.css";

const base = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: "אורגנו - ניתוח SEO, GEO ו-AEO במקום אחד",
    template: "%s | אורגנו",
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: "גיא רוזנברג", url: `${base}/about` }],
  creator: "גיא רוזנברג",
  publisher: "אורגנו",
  keywords: ["SEO", "GEO", "AEO", "ניתוח אתר", "קידום אורגני", "אופטימיזציה למנועי תשובות", "אופטימיזציה למנועי AI", "Schema", "בדיקת robots.txt"],
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    title: "אורגנו - מערכת צמיחה אורגנית חכמה",
    description: "ניתוח SEO, GEO ו-AEO עם המלצות ותוכן מוכן ליישום.",
    url: base,
    siteName,
    type: "website",
    locale: "he_IL",
  },
  twitter: {
    card: "summary",
    title: "אורגנו - מערכת צמיחה אורגנית חכמה",
    description: "ניתוח SEO, GEO ו-AEO עם המלצות ותוכן מוכן ליישום.",
  },
  category: "technology",
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${base}/#organization`,
      name: siteName,
      url: base,
      email: contactEmail,
      founder: { "@type": "Person", name: "גיא רוזנברג" },
    },
    {
      "@type": "WebSite",
      "@id": `${base}/#website`,
      url: base,
      name: siteName,
      description: siteDescription,
      inLanguage: "he-IL",
      publisher: { "@id": `${base}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${base}/#software`,
      name: siteName,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: base,
      description: siteDescription,
      inLanguage: "he-IL",
      creator: { "@id": `${base}/#organization` },
      offers: { "@type": "Offer", price: "0", priceCurrency: "ILS" },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <a className="skip-link" href="#main-content">דילוג לתוכן המרכזי</a>
        <AppChromeClient />
        <div id="main-content">{children}</div>
        <div className="global-action-stack">
          <Link className="global-history-link" href="/history" aria-label="פתח היסטוריית דוחות וסריקות">
            <span aria-hidden="true">H</span>
            היסטוריית דוחות
          </Link>
          <Link className="global-report-link" href="/report-builder" aria-label="הפקת דוח PDF ממותג מתוצאות הסריקה">
            <span aria-hidden="true">PDF</span>
            דו״ח PDF ממותג
          </Link>
          <Link className="global-monitor-link" href="/monitor" aria-label="פתח מסך מוניטור לאתר">
            <span aria-hidden="true" />
            מסך מוניטור
          </Link>
        </div>
        <OgiAssistant />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </body>
    </html>
  );
}
