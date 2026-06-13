"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <p className="text-xs text-slate-500">
            © תוכנן ונבנה על ידי גיא רוזנברג 2026 – כל הזכויות שמורות
          </p>

          <div className="flex gap-4 text-xs">
            <Link href="/privacy" className="text-slate-400 hover:text-cyan-400">
              מדיניות הפרטיות
            </Link>
            <Link href="/terms" className="text-slate-400 hover:text-cyan-400">
              תנאי השירות
            </Link>
            <a
              href="mailto:guyro76@gmail.com"
              className="text-slate-400 hover:text-cyan-400"
            >
              צור קשר
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
