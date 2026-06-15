"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon, type IconName } from "./Icons";
import { NewsTicker } from "./NewsTicker";

export const NAV_ITEMS: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/dashboard", label: "דשבורד סמכות", icon: "dashboard" },
  { href: "/profiles", label: "ניתוח פרופילים", icon: "compass" },
  { href: "/trends", label: "נושאים חמים", icon: "flame" },
  { href: "/influencers", label: "אושיות רשת", icon: "users" },
  { href: "/content-search", label: "חיפוש תוכן", icon: "search" },
  { href: "/content-factory", label: "מפעל תוכן", icon: "sparkles" },
  { href: "/content-calendar", label: "יומן תוכן", icon: "calendar" },
  { href: "/brand-kit", label: "Brand Kit", icon: "palette" },
  { href: "/settings", label: "הגדרות", icon: "settings" },
  { href: "/admin", label: "ניהול מערכת", icon: "shield" },
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
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1400px] gap-4 p-4 md:p-6">
        {/* Sidebar (right side in RTL) */}
        <aside
          className={`${
            open ? "fixed inset-0 z-40 block bg-black/30 backdrop-blur-sm" : "hidden"
          } md:static md:z-auto md:block md:bg-transparent`}
          onClick={() => setOpen(false)}
        >
          <div
            className="ml-auto flex h-full w-72 flex-col gap-3 md:w-64"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Score card */}
            <div className="glass-strong rounded-3xl p-5 border-2 border-cyan-500/50">
              <p className="text-xs font-semibold neon-glow neon-pink">ציון סמכות</p>
              <p className="mt-3 text-5xl font-black text-gradient animate-glow-text">
                {score}
              </p>
              <p className="text-sm neon-cyan">/100</p>
            </div>

            {/* Nav */}
            <nav className="glass flex flex-1 flex-col gap-2 rounded-3xl p-2 overflow-y-auto border border-magenta-500/30">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-end gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "border border-cyan-500/70 bg-gradient-to-l from-magenta-600/20 to-cyan-600/20 text-cyan-300 neon-glow shadow-lg"
                        : "border border-transparent text-cyan-200/60 hover:border-magenta-500/50 hover:text-magenta-300 hover:bg-magenta-900/10"
                    }`}
                  >
                    <span>{item.label}</span>
                    <Icon name={item.icon} size={18} className={active ? "text-cyan-400" : "text-magenta-400/70"} />
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* Header */}
          <header className="glass-strong flex items-center justify-between rounded-3xl px-5 py-4 border border-cyan-500/30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                className="glass rounded-xl px-3 py-2 text-sm md:hidden hover:border-magenta-500/50 border border-transparent transition-all neon-cyan"
                aria-label="תפריט"
              >
                <Icon name="menu" size={20} />
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="glass flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium neon-magenta hover:border-magenta-500/70 border border-transparent transition-all hover:shadow-lg"
              >
                יציאה
                <Icon name="logout" size={16} />
              </button>
            </div>

            {/* Live news ticker (center) — marketing, social & AI headlines */}
            <div className="mx-4 hidden min-w-0 flex-1 md:flex">
              <NewsTicker />
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <p className="text-lg font-extrabold leading-tight text-gradient animate-glow-text">
                  POSTWAVE
                </p>
                <p className="text-xs neon-cyan/50">
                  {name}
                  {isAdmin ? " · ADMIN" : ""}
                </p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-magenta-500/50 bg-gradient-to-br from-magenta-900/30 to-cyan-900/30 animate-neon-pulse">
                <Icon name="sparkles" size={24} className="neon-cyan animate-float-neon" />
              </div>
            </div>
          </header>

          <main className="flex flex-col gap-5">{children}</main>
        </div>
      </div>
    </div>
  );
}
