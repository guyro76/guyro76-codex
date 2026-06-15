// Client-side content store backed by localStorage so created content survives
// page refreshes and tab closes (sessionStorage did not). This keeps Postwave
// fully functional with zero backend/database dependency — every item the user
// generates is saved locally and listed in their content library.
//
// When a real database is wired later, this same API can be backed by it
// without changing any callers.

const ITEM_PREFIX = "postwave:content:";
const INDEX_KEY = "postwave:content:index";

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

/** Save (or overwrite) a content item and keep the library index in sync. */
export function saveContent(data: StoredContent): void {
  if (!hasStorage() || !data?.projectId) return;
  const item: StoredContent = { ...data, createdAt: data.createdAt || Date.now() };
  try {
    localStorage.setItem(ITEM_PREFIX + data.projectId, JSON.stringify(item));
    // Mirror to sessionStorage too, so existing readers keep working.
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
    ].slice(0, 100); // cap the library so storage never grows unbounded
    localStorage.setItem(INDEX_KEY, JSON.stringify(next));
  } catch {
    // storage full / unavailable — viewer still works from the in-memory push
  }
}

/** Read one content item by id (localStorage first, then sessionStorage). */
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

/** Newest-first list of saved content for the library view. */
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

/** Remove a content item from storage and the index. */
export function removeContent(id: string): void {
  if (!hasStorage()) return;
  try {
    localStorage.removeItem(ITEM_PREFIX + id);
    sessionStorage.removeItem(`carousel:${id}`);
    const next = listContent().filter((e) => e.id !== id);
    localStorage.setItem(INDEX_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}
