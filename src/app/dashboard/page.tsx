"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">טוען...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 bg-slate-900 border-l border-slate-800 flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold">
            AuthorityBoost
            <span className="text-cyan-400"> AI</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavLink href="/dashboard" label="דשבורד סמכות" />
          <NavLink href="/content-factory" label="מפעל תוכן" />
          <NavLink href="/content-search" label="חיפוש תוכן" />
          <NavLink href="/brand-kit" label="Brand Kit" />
          <NavLink href="/content-calendar" label="יומן תוכן" />
          <NavLink href="/settings" label="הגדרות" />
        </nav>

        <div className="border-t border-slate-800 p-4">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors"
          >
            התנתקות
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-900 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">דשבורד סמכות</h2>
            <div className="text-sm text-slate-400">
              {session?.user?.name || session?.user?.email}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                label="ציוני סמכות"
                value="—"
                desc="חובר כאשר תתחבר למערכות"
              />
              <StatCard
                label="תוכנים שנוצרו"
                value="0"
                desc="מעולם לא נוצר תוכן עדיין"
              />
              <StatCard
                label="עוקבים"
                value="—"
                desc="חובר כאשר תתחבר למערכות"
              />
            </div>

            {/* CTA Section */}
            <div className="bg-cyan-600/20 border border-cyan-500/30 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">בואו נתחיל ליצור</h3>
              <p className="text-slate-300 mb-6">
                בחר ממה למתחיל: קרוסלה, פוסט, או רילס שמעוררת השראה.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link
                  href="/content-factory?type=carousel"
                  className="px-8 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold transition-colors"
                >
                  ✨ צור קרוסלה
                </Link>
                <Link
                  href="/content-factory?type=post"
                  className="px-8 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 font-semibold transition-colors"
                >
                  📝 צור פוסט
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuickLink
                title="חיפוש תוכן"
                desc="מצא טרנדים וחדשות רלוונטיות"
                href="/content-search"
              />
              <QuickLink
                title="בנה Brand Kit"
                desc="צור זהות מותג אחידה"
                href="/brand-kit"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
    >
      {label}
    </a>
  );
}

function StatCard({
  label,
  value,
  desc,
}: {
  label: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <p className="text-slate-400 text-sm mb-2">{label}</p>
      <p className="text-3xl font-bold mb-2">{value}</p>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  );
}

function QuickLink({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-cyan-500/50 transition-colors"
    >
      <h4 className="font-bold mb-2">{title}</h4>
      <p className="text-sm text-slate-400">{desc}</p>
    </Link>
  );
}
