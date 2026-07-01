"use client";

import Link from "next/link";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HomeLink from "@/components/HomeLink";
import { createClient } from "@/lib/supabase/client";

type HeaderUser = { email: string; fullName: string; isAdmin: boolean };

export default function AppChromeClient() {
  const router = useRouter();
  const [user, setUser] = useState<HeaderUser | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser?.email || !active) return;
        const { data: profile } = await supabase.from("profiles").select("full_name,platform_role,access_status").eq("id", authUser.id).maybeSingle();
        if (!active || (profile?.access_status !== "active" && authUser.email.toLowerCase() !== "guyro76@gmail.com")) return;
        setUser({
          email: authUser.email,
          fullName: profile?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email.split("@")[0],
          isAdmin: profile?.platform_role === "platform_admin" || authUser.email.toLowerCase() === "guyro76@gmail.com",
        });
      } catch {
        setUser(null);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  async function leaveSystem() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (!user) return null;
  return <>
    <div className="app-chrome-space" aria-hidden="true" />
    <header className="app-chrome" aria-label="סרגל משתמש">
      <div className="app-chrome-actions"><HomeLink />{user.isAdmin && <Link href="/admin" className="chrome-button admin"><ShieldCheck /> ניהול מערכת</Link>}</div>
      <div className="app-user"><span><UserRound /></span><div><strong>{user.fullName || "משתמש אורגנו"}</strong><small>{user.email}</small></div><button onClick={leaveSystem}><LogOut /> יציאה</button></div>
    </header>
  </>;
}
