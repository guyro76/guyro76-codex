import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Resolve a writable SQLite path. On Vercel the only writable location is
// /tmp, so we store an ephemeral DB there. Locally we use ./dev.db.
// (Primary auth now runs through Supabase — see src/lib/supabase.ts — so this
// local store only backs optional, non-critical persistence.)
const getDbPath = () => {
  const url = process.env.DATABASE_URL || "";
  if (url.startsWith("file:")) {
    return url.replace("file:", "").replace(/^\.\//, "");
  }
  // Non-file DATABASE_URL (e.g. a postgres placeholder) — fall back to a
  // writable scratch file so the client never crashes on init.
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return "/tmp/authorityboost.db";
  }
  return "dev.db";
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: getDbPath(),
    }),
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
