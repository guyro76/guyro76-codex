// Content store.
//
// Two layers, deliberately:
//
//   • localStorage — instant, offline, and the fallback when the server store
//     is not configured. Reads never block on the network.
//   • the server (/api/content) — durable, shared between devices, and the
//     only layer the MCP server can see.
//
// The synchronous functions are the local layer and behave exactly as before,
// so existing callers keep working. The async ones talk to the server and fall
// back to local on any failure, which makes the server a progressive
// enhancement rather than a new way for the app to break.

const ITEM_PREFIX = "postwave:content:";
const INDEX_KEY = "postwave:content:index";
const MIGRATED_KEY = "postwave:content:migrated";

export interface StoredSlide {
  headline: string;
  body: string;
  imageQuery?: string;
}

export interface StoredContent {
  projectId: string;
  topic: string;
  slides: StoredSlide[];
  images: string[];
  design?: string;
  template?: { name: string; colors: string[]; fonts: string };
  dimensions?: { width: number; height: number; ratio: string };
  contentType?: string;
  aiGenerated?: boolean;
  createdAt?: number;
}

export interface ContentIndexEntry {
  id: string;
  topic: string;
  contentType: string;
  createdAt: number;
}

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

// --- local layer (synchronous) ----------------------------------------------

/** Save (or overwrite) locally and keep the library index in sync. */
export function saveContentLocal(data: StoredContent): void {
  if (!hasStorage() || !data?.projectId) return;
  const item: StoredContent = { ...data, createdAt: data.createdAt || Date.now() };
  try {
    localStorage.setItem(ITEM_PREFIX + data.projectId, JSON.stringify(item));
    sessionStorage.setItem(`carousel:${data.projectId}`, JSON.stringify(item));

    const index = listContent();
    const next: ContentIndexEntry[] = [
      {
        id: data.projectId,
        topic: data.topic || "תוכן חדש",
        contentType: data.contentType || "carousel",
        createdAt: item.createdAt!,
      },
      ...index.filter((e) => e.id !== data.projectId),
    ].slice(0, 100);
    localStorage.setItem(INDEX_KEY, JSON.stringify(next));
  } catch {
    // storage full or blocked — the viewer still works from memory
  }
}

/** Read one item from the local cache. */
export function getContent(id: string): StoredContent | null {
  if (!hasStorage()) return null;
  try {
    const raw =
      localStorage.getItem(ITEM_PREFIX + id) ||
      sessionStorage.getItem(`carousel:${id}`);
    return raw ? (JSON.parse(raw) as StoredContent) : null;
  } catch {
    return null;
  }
}

/** Newest-first local index. */
export function listContent(): ContentIndexEntry[] {
  if (!hasStorage()) return [];
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    const list = raw ? (JSON.parse(raw) as ContentIndexEntry[]) : [];
    return list.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

function removeLocal(id: string): void {
  if (!hasStorage()) return;
  try {
    localStorage.removeItem(ITEM_PREFIX + id);
    sessionStorage.removeItem(`carousel:${id}`);
    localStorage.setItem(
      INDEX_KEY,
      JSON.stringify(listContent().filter((e) => e.id !== id))
    );
  } catch {
    // ignore
  }
}

// --- server layer ------------------------------------------------------------

/** Shape the server expects. */
function toPayload(data: StoredContent) {
  return {
    id: data.projectId,
    topic: data.topic,
    contentType: data.contentType || "carousel",
    design: data.design ?? null,
    slides: data.slides ?? [],
    images: data.images ?? [],
    dimensions: data.dimensions ?? null,
    template: data.template ?? null,
    aiGenerated: Boolean(data.aiGenerated),
  };
}

/** Server record back into the shape the UI already renders. */
function fromRecord(r: Record<string, unknown>): StoredContent {
  return {
    projectId: String(r.id),
    topic: String(r.topic ?? ""),
    contentType: String(r.contentType ?? "carousel"),
    slides: (r.slides as StoredSlide[]) ?? [],
    images: (r.images as string[]) ?? [],
    design: (r.design as string) ?? undefined,
    template: (r.template as StoredContent["template"]) ?? undefined,
    dimensions: (r.dimensions as StoredContent["dimensions"]) ?? undefined,
    aiGenerated: Boolean(r.aiGenerated),
    createdAt: r.createdAt ? new Date(String(r.createdAt)).getTime() : Date.now(),
  };
}

/**
 * Save locally at once, then push to the server.
 *
 * Local first is what keeps the editor responsive and correct offline; the
 * push is best-effort and never blocks the caller.
 */
export function saveContent(data: StoredContent): void {
  saveContentLocal(data);
  void fetch("/api/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(data)),
  }).catch(() => {
    // offline or not configured — the local copy stands
  });
}

/** The library, from the server when available, else the local index. */
export async function fetchLibrary(): Promise<{
  items: ContentIndexEntry[];
  source: "server" | "local";
}> {
  try {
    const res = await fetch("/api/content", { cache: "no-store" });
    const data = await res.json();
    if (res.ok && data.configured && Array.isArray(data.items)) {
      const items: ContentIndexEntry[] = data.items.map(
        (r: Record<string, unknown>) => ({
          id: String(r.id),
          topic: String(r.topic ?? "תוכן"),
          contentType: String(r.contentType ?? "carousel"),
          createdAt: r.createdAt
            ? new Date(String(r.createdAt)).getTime()
            : Date.now(),
        })
      );
      return { items, source: "server" };
    }
  } catch {
    // fall through to local
  }
  return { items: listContent(), source: "local" };
}

/**
 * One item. The local cache answers first for speed; the server is consulted
 * when the cache misses, which is what makes a link open on another device.
 */
export async function fetchContent(id: string): Promise<StoredContent | null> {
  const local = getContent(id);
  if (local) return local;

  try {
    const res = await fetch(`/api/content/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.item) {
      const record = fromRecord(data.item);
      saveContentLocal(record); // warm the cache for next time
      return record;
    }
  } catch {
    // offline — nothing more to try
  }
  return null;
}

/** Delete in both layers. */
export async function removeContent(id: string): Promise<void> {
  removeLocal(id);
  try {
    await fetch(`/api/content/${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch {
    // ignore — local copy is gone either way
  }
}

/**
 * Carry an existing browser-local library onto the server, once per browser.
 *
 * Without this, everything created before the server store existed would stay
 * invisible to other devices and to the MCP server. Ids are preserved, so the
 * import merges rather than duplicating and is safe to retry.
 */
export async function migrateLocalToServer(): Promise<number> {
  if (!hasStorage()) return 0;
  try {
    if (localStorage.getItem(MIGRATED_KEY)) return 0;

    const entries = listContent();
    if (entries.length === 0) {
      localStorage.setItem(MIGRATED_KEY, "1");
      return 0;
    }

    const items = entries
      .map((e) => getContent(e.id))
      .filter((c): c is StoredContent => Boolean(c))
      .map(toPayload);

    if (items.length === 0) return 0;

    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    const data = await res.json().catch(() => ({}));

    // Only mark done on a real success, so a failed attempt retries later.
    if (res.ok && data.configured) {
      localStorage.setItem(MIGRATED_KEY, "1");
      return Number(data.imported) || 0;
    }
  } catch {
    // try again on a later visit
  }
  return 0;
}
