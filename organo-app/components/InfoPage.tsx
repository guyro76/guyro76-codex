import Link from "next/link";
import type { ReactNode } from "react";
import { Leaf, ArrowRight } from "lucide-react";

export function InfoPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return (
    <main className="info-shell">
      <nav className="info-nav" aria-label="ניווט עמודי מידע">
        <Link href="/" className="info-brand"><Leaf aria-hidden="true" /> אורגנו</Link>
        <div>
          <Link href="/about">אודות</Link>
          <Link href="/privacy">פרטיות</Link>
          <Link href="/accessibility">נגישות</Link>
          <Link href="/security">אבטחה</Link>
          <Link href="/terms">תנאי שימוש</Link>
        </div>
      </nav>
      <article className="info-card glass">
        <Link href="/" className="back-link"><ArrowRight aria-hidden="true" /> חזרה למערכת</Link>
        <p className="info-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="info-intro">{intro}</p>
        <div className="info-content">{children}</div>
      </article>
      <footer className="info-footer">אורגנו · תוכנן ונבנה על ידי גיא רוזנברג 2026</footer>
    </main>
  );
}
