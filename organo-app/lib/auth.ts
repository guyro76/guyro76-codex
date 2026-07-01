import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAuthConfigured } from "@/lib/supabase/env";

export type CurrentAccess = {
  id: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
  accessStatus: string;
};

export async function getCurrentAccess(): Promise<CurrentAccess | null> {
  if (!isSupabaseAuthConfigured()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,platform_role,access_status")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email,
    fullName: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || "",
    isAdmin: profile?.platform_role === "platform_admin" || user.email.toLowerCase() === "guyro76@gmail.com",
    accessStatus: profile?.access_status || (user.email.toLowerCase() === "guyro76@gmail.com" ? "active" : "pending"),
  };
}

export async function requireActiveUser() {
  const access = await getCurrentAccess();
  if (!access || access.accessStatus !== "active") redirect("/login");
  return access;
}

export async function requirePlatformAdmin() {
  const access = await requireActiveUser();
  if (!access.isAdmin) redirect("/");
  return access;
}
