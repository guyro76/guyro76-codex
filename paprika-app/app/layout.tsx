import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'פפריקה - מערכת ניהול סוכנות PPC',
  description: 'מערכת ניהול לקוחות, משימות, אופטימיזציה וידע מקצועי לסוכנויות Google Ads ו-Meta Ads.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
