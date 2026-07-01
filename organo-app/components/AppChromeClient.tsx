"use client";

import Link from "next/link";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import HomeLink from "@/components/HomeLink";
import { createClient } from "@/lib/supabase/client";

export default function AppChromeClient({ email, fullName, isAdmin }: { email: string; fullName: string; isAdmin: boolean }) {
  const router = useRouter();

  async function leaveSystem() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return <>
    <div className="app-chrome-space" aria-hidden="true" />
    <header className="app-chrome" aria-label="סרגל משתמש">
      <div className="app-chrome-actions"><HomeLink />{isAdmin && <Link href="/admin" className="chrome-button admin"><ShieldCheck /> ניהול מערכת</Link>}</div>
      <div className="app-user"><span><UserRound /></span><div><strong>{fullName || "משתמש אורגנו"}</strong><small>{email}</small></div><button onClick={leaveSystem}><LogOut /> יציאה</button></div>
    </header>
  </>;
}
