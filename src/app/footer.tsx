"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t edge surface/50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <p className="text-xs ink-muted">
            © תוכנן ונבנה על ידי גיא רוזנברג 2026 – כל הזכויות שמורות
          </p>

          <div className="flex gap-4 text-xs">
            <Link href="/privacy" className="ink-muted hover:accent-ink">
              מדיניות הפרטיות
            </Link>
            <Link href="/terms" className="ink-muted hover:accent-ink">
              תנאי השירות
            </Link>
            <a
              href="mailto:guyro76@gmail.com"
              className="ink-muted hover:accent-ink"
            >
              צור קשר
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
