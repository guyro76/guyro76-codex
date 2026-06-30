import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const blockedHostnames = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
]);

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 2) ||
    (a === 198 && (b === 18 || b === 19 || b === 51)) ||
    (a === 203 && b === 0) ||
    a >= 224
  );
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb") ||
    normalized.startsWith("2001:db8") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.")
  );
}

export function normalizeUrl(input: string): URL {
  const raw = input.trim();
  if (!raw) throw new Error("יש להזין כתובת אתר");
  const value = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("ניתן לנתח רק כתובות HTTP או HTTPS");
  }
  if (url.username || url.password) {
    throw new Error("כתובות עם פרטי התחברות אינן נתמכות");
  }
  return url;
}

export async function assertPublicUrl(url: URL): Promise<void> {
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (blockedHostnames.has(hostname) || hostname.endsWith(".local")) {
    throw new Error("לא ניתן לנתח כתובת פנימית או מקומית");
  }

  if (isIP(hostname)) {
    if ((isIP(hostname) === 4 && isPrivateIPv4(hostname)) || (isIP(hostname) === 6 && isPrivateIPv6(hostname))) {
      throw new Error("לא ניתן לנתח כתובת IP פרטית");
    }
    return;
  }

  const addresses = await lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length) throw new Error("לא נמצאה כתובת IP עבור הדומיין");
  for (const item of addresses) {
    if ((item.family === 4 && isPrivateIPv4(item.address)) || (item.family === 6 && isPrivateIPv6(item.address))) {
      throw new Error("הדומיין מפנה לכתובת פנימית ולכן נחסם מטעמי אבטחה");
    }
  }
}

export async function safeFetch(
  initialUrl: URL,
  options: { timeoutMs?: number; maxBytes?: number; accept?: string } = {},
): Promise<{ response: Response; body: string; finalUrl: URL; redirects: number }> {
  const timeoutMs = options.timeoutMs ?? 12_000;
  const maxBytes = options.maxBytes ?? 1_800_000;
  let current = initialUrl;
  let redirects = 0;

  while (redirects <= 5) {
    await assertPublicUrl(current);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;
    try {
      response = await fetch(current, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "OrganoAuditBot/1.0",
          Accept: options.accept ?? "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
        },
        cache: "no-store",
      });
    } finally {
      clearTimeout(timer);
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error("האתר החזיר הפניה ללא יעד");
      current = new URL(location, current);
      redirects += 1;
      continue;
    }

    const declaredLength = Number(response.headers.get("content-length") || 0);
    if (declaredLength > maxBytes) throw new Error("העמוד גדול מדי לניתוח מהיר");

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > maxBytes) throw new Error("העמוד גדול מדי לניתוח מהיר");
    const body = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
    return { response, body, finalUrl: current, redirects };
  }

  throw new Error("האתר ביצע יותר מדי הפניות");
}
