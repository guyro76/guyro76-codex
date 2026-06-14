"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "דשבורד סמכות", icon: "📊" },
  { href: "/profiles", label: "ניתוח פרופילים", icon: "🧭" },
  { href: "/trends", label: "נושאים חמים", icon: "🔥" },
  { href: "/influencers", label: "אושיות רשת", icon: "👥" },
  { href: "/content-search", label: "חיפוש תוכן", icon: "🔎" },
  { href: "/content-factory", label: "מפעל תוכן", icon: "✨" },
  { href: "/content-calendar", label: "יומן תוכן", icon: "🗓️" },
  { href: "/brand-kit", label: "Brand Kit", icon: "🎨" },
  { href: "/settings", label: "הגדרות", icon: "⚙️" },
  { href: "/admin", label: "ניהול מערכת", icon: "🛡️" },
];

export function AppShell({
  children,
  score = 87,
}: {
  children: React.ReactNode;
  score?: number;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const name = session?.user?.name || "Guy Rosenberg";
  const isAdmin = (session?.user?.email || "").toLowerCase() === "guyro76@gmail.com";

  return (
    <div className="min-h-screen bg-[#06060b] text-white">
      <div className="mx-auto flex max-w-[1400px] gap-5 p-4 md:p-6">
        {/* Sidebar (right side in RTL) */}
        <aside
          className={`${
            open ? "fixed inset-0 z-40 block bg-black/60" : "hidden"
          } md:static md:z-auto md:block md:bg-transparent`}
          onClick={() => setOpen(false)}
        >
          <div
            className="ml-auto flex h-full w-72 flex-col gap-3 md:w-64"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Score card */}
            <div className="rounded-3xl border border-white/5 bg-[#0e0e16] p-5">
              <p className="text-xs text-slate-400">ציון סמכות</p>
              <p className="mt-1 text-4xl font-black tracking-tight">
                {score}
                <span className="text-slate-500">/100</span>
              </p>
            </div>

            {/* Nav */}
            <nav className="flex flex-1 flex-col gap-1 rounded-3xl border border-white/5 bg-[#0e0e16] p-3">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-end gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                      active
                        ? "bg-sky-400 font-bold text-slate-950"
                        : "text-slate-200 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-base">{item.icon}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* Header */}
          <header className="flex items-center justify-between rounded-3xl border border-white/5 bg-[#0e0e16] px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                className="rounded-xl border border-white/10 px-3 py-2 text-sm md:hidden"
                aria-label="תפריט"
              >
                ☰
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5"
              >
                יציאה <span aria-hidden>↩</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <p className="text-lg font-extrabold leading-tight">
                  AuthorityBoost AI
                </p>
                <p className="text-xs text-slate-400">
                  {name}
                  {isAdmin ? " · מנהל מערכת" : ""}
                </p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-300 text-xl text-slate-900">
                🧠
              </div>
            </div>
          </header>

          <main className="flex flex-col gap-5">{children}</main>
        </div>
      </div>
    </div>
  );
}
