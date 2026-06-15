"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon, type IconName } from "./Icons";

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
            <div className="glass rounded-3xl p-5">
              <p className="text-xs font-semibold text-pink-600">ציון סמכות</p>
              <p className="mt-2 text-5xl font-black bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                {score}
                <span className="text-lg text-slate-500">/100</span>
              </p>
            </div>

            {/* Nav */}
            <nav className="glass flex flex-1 flex-col gap-1 rounded-3xl p-2 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-end gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                      active
                        ? "bg-gradient-to-l from-pink-300 to-violet-300 text-slate-950 shadow-md"
                        : "text-slate-600 hover:bg-white/40 hover:text-slate-800"
                    }`}
                  >
                    <span>{item.label}</span>
                    <Icon name={item.icon} size={18} />
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* Header */}
          <header className="glass flex items-center justify-between rounded-3xl px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                className="glass rounded-xl px-3 py-2 text-sm md:hidden hover:bg-white/40 transition-colors"
                aria-label="תפריט"
              >
                <Icon name="menu" size={20} />
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="glass flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white/40 transition-colors"
              >
                יציאה
                <Icon name="logout" size={16} />
              </button>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <p className="text-lg font-extrabold leading-tight text-gradient">
                  Postwave
                </p>
                <p className="text-xs text-slate-600">
                  {name}
                  {isAdmin ? " · מנהל" : ""}
                </p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-pink-300 to-violet-300 shadow-lg">
                <Icon name="sparkles" size={24} className="text-violet-700" />
              </div>
            </div>
          </header>

          <main className="flex flex-col gap-5">{children}</main>
        </div>
      </div>
    </div>
  );
}
