import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const blockedHostnames = new Set(["localhost", "localhost.localdomain", "metadata.google.internal"]);
export type FetchSource = "direct" | "browser-retry" | "reader" | "proxy";

type SafeFetchOptions = {
  timeoutMs?: number;
  maxBytes?: number;
  accept?: string;
  allowReaderFallback?: boolean;
};

type SafeFetchResult = {
  response: Response;
  body: string;
  finalUrl: URL;
  redirects: number;
  source: FetchSource;
  limited: boolean;
};

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return true;
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 2) ||
    (a === 198 && (b === 18 || b === 19 || b === 51)) ||
    (a === 203 && b === 0) || a >= 224;
}

function isPrivateIPv6(ip: string): boolean {
  const value = ip.toLowerCase();
  return value === "::" || value === "::1" || value.startsWith("fc") || value.startsWith("fd") ||
    value.startsWith("fe8") || value.startsWith("fe9") || value.startsWith("fea") || value.startsWith("feb") ||
    value.startsWith("2001:db8") || value.startsWith("::ffff:127.") || value.startsWith("::ffff:10.") || value.startsWith("::ffff:192.168.");
}

export function normalizeUrl(input: string): URL {
  const raw = input.trim();
  if (!raw) throw new Error("יש להזין כתובת אתר");
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw);
  let url: URL;
  try {
    url = new URL(hasScheme ? raw : `https://${raw}`);
  } catch {
    throw new Error("כתובת האתר אינה תקינה");
  }
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("ניתן לנתח רק כתובות HTTP או HTTPS");
  if (url.username || url.password) throw new Error("כתובות עם פרטי התחברות אינן נתמכות");
  return url;
}

export async function assertPublicUrl(url: URL): Promise<void> {
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (blockedHostnames.has(hostname) || hostname.endsWith(".local")) throw new Error("לא ניתן לנתח כתובת פנימית או מקומית");
  const version = isIP(hostname);
  if (version) {
    if ((version === 4 && isPrivateIPv4(hostname)) || (version === 6 && isPrivateIPv6(hostname))) throw new Error("לא ניתן לנתח כתובת IP פרטית");
    return;
  }
  let addresses;
  try {
    addresses = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new Error("לא ניתן היה לאתר את שרת האתר. ייתכן שמדובר בתקלה זמנית ב-DNS");
  }
  if (!addresses.length) throw new Error("לא נמצאה כתובת IP עבור הדומיין");
  for (const address of addresses) {
    if ((address.family === 4 && isPrivateIPv4(address.address)) || (address.family === 6 && isPrivateIPv6(address.address))) {
      throw new Error("הדומיין מפנה לכתובת פנימית ולכן נחסם מטעמי אבטחה");
    }
  }
}

const browserHeaders = (accept: string): Record<string, string> => ({
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
  Accept: accept,
  "Accept-Language": "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "Upgrade-Insecure-Requests": "1",
});

async function readBody(response: Response, maxBytes: number): Promise<string> {
  const length = Number(response.headers.get("content-length") || 0);
  if (length > maxBytes) throw new Error("העמוד גדול מדי לניתוח מהיר");
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > maxBytes) throw new Error("העמוד גדול מדי לניתוח מהיר");
  return new TextDecoder("utf-8", { fatal: false }).decode(buffer);
}

async function timedFetch(url: URL, timeoutMs: number, maxBytes: number, headers: Record<string, string>, redirect: RequestRedirect = "manual") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { redirect, signal: controller.signal, headers, cache: "no-store" });
    const body = await readBody(response, maxBytes);
    return { response, body };
  } finally {
    clearTimeout(timer);
  }
}

function syntheticResult(body: string, target: URL, source: FetchSource): SafeFetchResult {
  return {
    response: new Response(body, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "x-organo-fetch-source": source } }),
    body,
    finalUrl: target,
    redirects: 0,
    source,
    limited: true,
  };
}

async function jinaFallback(target: URL, maxBytes: number): Promise<SafeFetchResult> {
  const readerUrl = new URL(`https://r.jina.ai/${target.toString()}`);
  const { response, body } = await timedFetch(readerUrl, 7_000, maxBytes, {
    Accept: "text/html",
    "X-Respond-With": "html",
    "X-Engine": "browser",
    "X-No-Cache": "true",
    "X-Timeout": "6",
  }, "follow");
  if (!response.ok || body.trim().length < 80) throw new Error(`Jina HTTP ${response.status}`);
  return syntheticResult(body, target, "reader");
}

async function publicProxyFallback(target: URL, maxBytes: number): Promise<SafeFetchResult> {
  const proxyUrl = new URL("https://api.allorigins.win/raw");
  proxyUrl.searchParams.set("url", target.toString());
  const { response, body } = await timedFetch(proxyUrl, 9_000, maxBytes, {
    Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
    "User-Agent": "OrganoPublicPageReader/1.0",
  }, "follow");
  if (!response.ok || body.trim().length < 80) throw new Error(`Proxy HTTP ${response.status}`);
  return syntheticResult(body, target, "proxy");
}

async function fallbackFetch(target: URL, maxBytes: number): Promise<SafeFetchResult> {
  try {
    return await jinaFallback(target, maxBytes);
  } catch {
    try {
      return await publicProxyFallback(target, maxBytes);
    } catch {
      throw new Error("האתר חסם את הסריקה וכל מנגנוני הקריאה החלופיים לא הצליחו לקרוא אותו");
    }
  }
}

function alternateHost(url: URL): URL | null {
  if (isIP(url.hostname) || url.hostname === "localhost") return null;
  const alternate = new URL(url);
  alternate.hostname = url.hostname.startsWith("www.") ? url.hostname.slice(4) : `www.${url.hostname}`;
  return alternate;
}

export async function safeFetch(initialUrl: URL, options: SafeFetchOptions = {}): Promise<SafeFetchResult> {
  const timeoutMs = options.timeoutMs ?? 6_000;
  const maxBytes = options.maxBytes ?? 1_800_000;
  const accept = options.accept ?? "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";
  const allowFallback = options.allowReaderFallback ?? true;
  let current = initialUrl;
  let redirects = 0;
  let source: FetchSource = "direct";

  while (redirects <= 5) {
    await assertPublicUrl(current);
    try {
      const { response, body } = await timedFetch(current, timeoutMs, maxBytes, browserHeaders(accept));
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) throw new Error("האתר החזיר הפניה ללא יעד");
        current = new URL(location, current);
        redirects += 1;
        continue;
      }
      if ([403, 406, 429].includes(response.status) && allowFallback) return fallbackFetch(current, maxBytes);
      return { response, body, finalUrl: current, redirects, source, limited: false };
    } catch (error) {
      const alternate = alternateHost(current);
      if (alternate && source === "direct") {
        try {
          await assertPublicUrl(alternate);
          const retry = await timedFetch(alternate, 4_500, maxBytes, browserHeaders(accept));
          source = "browser-retry";
          if ([301, 302, 303, 307, 308].includes(retry.response.status)) {
            const location = retry.response.headers.get("location");
            if (location) {
              current = new URL(location, alternate);
              redirects += 1;
              continue;
            }
          }
          if (retry.response.ok) return { response: retry.response, body: retry.body, finalUrl: alternate, redirects, source, limited: false };
        } catch {
          // Continue to safe public-page fallbacks.
        }
      }
      if (allowFallback) return fallbackFetch(current, maxBytes);
      if (error instanceof Error && error.name === "AbortError") throw new Error("האתר לא הגיב בזמן שהוקצב לסריקה");
      throw error;
    }
  }
  throw new Error("האתר ביצע יותר מדי הפניות");
}
