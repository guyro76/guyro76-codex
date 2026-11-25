import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;

  // Signing in with the owner access code grants the admin role directly, so
  // it does not depend on ADMIN_EMAIL also being set.
  const role = (session.user as { role?: string }).role;
  if (role === "admin") return true;

  const adminEmail = (process.env.ADMIN_EMAIL || "").trim();
  return Boolean(adminEmail) && session.user.email === adminEmail;
}

export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized - Admin access required");
  }
}
