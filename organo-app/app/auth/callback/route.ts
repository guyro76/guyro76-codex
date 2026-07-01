import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const current = new URL(request.url);
  const code = current.searchParams.get("code");
  const nextParam = current.searchParams.get("next") || "/";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";
  if (!code) return NextResponse.redirect(new URL("/login?error=oauth", current.origin));

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=oauth", current.origin));

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.redirect(new URL("/login?error=oauth", current.origin));
  const { data: profile } = await supabase.from("profiles").select("access_status").eq("id", user.id).maybeSingle();
  const allowed = user.email.toLowerCase() === "guyro76@gmail.com" || profile?.access_status === "active";
  if (!allowed) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?error=not-authorized", current.origin));
  }
  return NextResponse.redirect(new URL(next, current.origin));
}
