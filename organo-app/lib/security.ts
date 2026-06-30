import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const blockedHostnames = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
]);

export type FetchSource = "direct" | "browser-retry" | "reader";

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

  const hasExplicitScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw);
  const value = hasExplicitScheme ? raw : `https://${raw}`;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("כתובת האתר אינה תקינה");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("ניתן לנתח רק כתובות HTTP או HTTPS");
  }
  if (url.username || url.password) {
    throw new Error("כתובות עם פרטי התחברות אינן נתמכות");
  }
  return url;
}

export async function assertPublicUrl(url: URL): Promise<void> {
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (blockedHostnames.has(hostname) || hostname.endsWith(".local")) {
    throw new Error("לא ניתן לנתח כתובת פנימית או מקומית");
  }

  if (isIP(hostname)) {
    if ((isIP(hostname) === 4 && isPrivateIPv4(hostname)) || (isIP(hostname) === 6 && isPrivateIPv6(hostname))) {
      throw new Error("לא ניתן לנתח כתובת IP פרטית");
    }
    return;
  }

  let addresses;
  try {
    addresses = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new Error("לא ניתן היה לאתר את שרת האתר. ייתכן שמדובר בתקלה זמנית ב-DNS");
  }
  if (!addresses.length) throw new Error("לא נמצאה כתובת IP עבור הדומיין");
  for (const item of addresses) {
    if ((item.family === 4 && isPrivateIPv4(item.address)) || (item.family === 6 && isPrivateIPv6(item.address))) {
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
  const declaredLength = Number(response.headers.get("content-length") || 0);
  if (declaredLength > maxBytes) throw new Error("העמוד גדול מדי לניתוח מהיר");
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > maxBytes) throw new Error("העמוד גדול מדי לניתוח מהיר");
  return new TextDecoder("utf-8", { fatal: false }).decode(buffer);
}

async function requestOnce(url: URL, timeoutMs: number, maxBytes: number, accept: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: "manual",
      signal: controller.signal,
      headers: browserHeaders(accept),
      cache: "no-store",
    });
    const body = await readBody(response, maxBytes);
    return { response, body };
  } finally {
    clearTimeout(timer);
  }
}

function alternateHost(url: URL): URL | null {
  if (isIP(url.hostname) || url.hostname === "localhost") return null;
  const alternate = new URL(url);
  alternate.hostname = url.hostname.startsWith("www.") ? url.hostname.slice(4) : `www.${url.hostname}`;
  return alternate;
}

async function readerFallback(target: URL, maxBytes: number): Promise<SafeFetchResult> {
  const readerUrl = new URL(`https://r.jina.ai/${target.toString()}`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(readerUrl, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Accept: "text/html",
        "X-Respond-With": "html",
        "X-Engine": "browser",
        "X-No-Cache": "true",
        "X-Timeout": "8",
      },
    });
    if (!response.ok) throw new Error(`Reader HTTP ${response.status}`);
    const body = await readBody(response, maxBytes);
    const synthetic = new Response(body, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "x-organo-fetch-source": "reader",
      },
    });
    return { response: synthetic, body, finalUrl: target, redirects: 0, source: "reader", limited: true };
  } catch {
    throw new Error("האתר חסם את הסריקה וגם מנגנון הדפדפן החלופי לא הצליח לקרוא אותו");
  } finally {
    clearTimeout(timer);
  }
}

export async function safeFetch(
  initialUrl: URL,
  options: SafeFetchOptions = {},
): Promise<SafeFetchResult> {
  const timeoutMs = options.timeoutMs ?? 7_000;
  const maxBytes = options.maxBytes ?? 1_800_000;
  const accept = options.accept ?? "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";
  const allowReaderFallback = options.allowReaderFallback ?? true;
  let current = initialUrl;
  let redirects = 0;
  let source: FetchSource = "direct";

  while (redirects <= 5) {
    await assertPublicUrl(current);
    try {
      const { response, body } = await requestOnce(current, timeoutMs, maxBytes, accept);
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) throw new Error("האתר החזיר הפניה ללא יעד");
        current = new URL(location, current);
        redirects += 1;
        continue;
      }

      if ([403, 406, 429].includes(response.status) && allowReaderFallback) {
        return readerFallback(current, maxBytes);
      }
      return { response, body, finalUrl: current, redirects, source, limited: false };
    } catch (error) {
      const alternate = alternateHost(current);
      if (alternate && source === "direct") {
        try {
          await assertPublicUrl(alternate);
          const result = await requestOnce(alternate, 5_000, maxBytes, accept);
          source = "browser-retry";
          if ([301, 302, 303, 307, 308].includes(result.response.status)) {
            const location = result.response.headers.get("location");
            if (location) {
              current = new URL(location, alternate);
              redirects += 1;
              continue;
            }
          }
          if (result.response.ok) {
            return { response: result.response, body: result.body, finalUrl: alternate, redirects, source, limited: false };
          }
        } catch {
          // Continue to browser-rendered fallback below.
        }
      }
      if (allowReaderFallback) return readerFallback(current, maxBytes);
      if (error instanceof Error && error.name === "AbortError") throw new Error("האתר לא הגיב בזמן שהוקצב לסריקה");
      throw error;
    }
  }

  throw new Error("האתר ביצע יותר מדי הפניות");
}
