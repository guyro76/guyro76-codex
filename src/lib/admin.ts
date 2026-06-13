import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.email === process.env.ADMIN_EMAIL;
}

export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized - Admin access required");
  }
}
