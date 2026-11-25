import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { NextRequest } from "next/server";

/**
 * Postwave is normally driven by a signed-in browser session. The MCP server
 * and other automated clients have no session, so they authenticate with a
 * shared key instead.
 *
 * Set POSTWAVE_API_KEY in the environment and send it as `x-postwave-key`
 * (or `Authorization: Bearer <key>`).
 */

export interface Caller {
  ok: boolean;
  /** Stable identity for persistence: the user's email, or the key's label. */
  id: string;
  via: "session" | "api-key" | "none";
}

function timingSafeEqual(a: string, b: string): boolean {
  // Avoid leaking key length/content through early-exit comparison.
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function readKey(req: NextRequest | Request): string | null {
  const h = req.headers;
  const direct = h.get("x-postwave-key");
  if (direct) return direct.trim();
  const auth = h.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return null;
}

/** True when an API key is configured at all. */
export function apiKeyConfigured(): boolean {
  return Boolean((process.env.POSTWAVE_API_KEY || "").trim());
}

/**
 * Resolve the caller from either a browser session or an API key.
 * Never throws — callers decide what to do with `ok: false`.
 */
export async function resolveCaller(req: NextRequest | Request): Promise<Caller> {
  const configured = (process.env.POSTWAVE_API_KEY || "").trim();
  const presented = readKey(req);

  if (configured && presented && timingSafeEqual(configured, presented)) {
    return { ok: true, id: "mcp-client", via: "api-key" };
  }

  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      return { ok: true, id: session.user.email, via: "session" };
    }
  } catch {
    // session lookup unavailable — fall through to unauthenticated
  }

  return { ok: false, id: "", via: "none" };
}
