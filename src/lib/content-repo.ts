// Server-side content library, backed by Supabase Postgres.
//
// This module is SERVER ONLY — it holds the service-role key. Importing it
// from a client component would ship that key to the browser.
//
// Why the service role: Postwave's auth currently lives in a different
// Supabase project, so a user JWT issued by auth will not validate here.
// The table therefore has RLS on with no permissive policy — anon and
// authenticated are denied outright — and the server is the only writer,
// scoping every query by owner_email itself.

import "server-only";

const REST_URL = (
  process.env.SUPABASE_CONTENT_URL ||
  "https://ueswnbbyxytvmjydvvwv.supabase.co"
).replace(/\/+$/, "");

const TABLE = "postwave_content";

function serviceKey(): string {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
}

/**
 * Treat the store as available when a key is present, or when the deployment
 * explicitly says the key is supplied at the network layer (a proxy that
 * injects the `apikey` header), in which case this process never sees it.
 */
export function isContentDbConfigured(): boolean {
  return Boolean(serviceKey()) || process.env.SUPABASE_KEY_VIA_PROXY === "1";
}

export interface Slide {
  headline: string;
  body: string;
  imageQuery?: string;
}

export interface ContentRecord {
  id: string;
  topic: string;
  contentType: string;
  platform?: string | null;
  design?: string | null;
  theme?: string | null;
  slides: Slide[];
  images: string[];
  dimensions?: { width: number; height: number; ratio: string } | null;
  template?: { name: string; colors: string[]; fonts: string } | null;
  geoScore?: number | null;
  status: string;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

type Row = Record<string, unknown>;

function toRecord(row: Row): ContentRecord {
  return {
    id: String(row.id),
    topic: String(row.topic ?? ""),
    contentType: String(row.content_type ?? "carousel"),
    platform: (row.platform as string) ?? null,
    design: (row.design as string) ?? null,
    theme: (row.theme as string) ?? null,
    slides: Array.isArray(row.slides) ? (row.slides as Slide[]) : [],
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    dimensions: (row.dimensions as ContentRecord["dimensions"]) ?? null,
    template: (row.template as ContentRecord["template"]) ?? null,
    geoScore: (row.geo_score as number) ?? null,
    status: String(row.status ?? "draft"),
    aiGenerated: Boolean(row.ai_generated),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

async function rest(
  path: string,
  init: RequestInit & { prefer?: string } = {}
): Promise<Response> {
  const key = serviceKey();
  if (!key && process.env.SUPABASE_KEY_VIA_PROXY !== "1") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.prefer ? { Prefer: init.prefer } : {}),
    ...((init.headers as Record<string, string>) || {}),
  };

  // With a key in the environment we authenticate directly. Without one, the
  // network layer supplies `apikey`, and sending a bearer token we do not have
  // would only override it with something invalid.
  if (key) {
    headers.apikey = key;
    headers.Authorization = `Bearer ${key}`;
  }

  return fetch(`${REST_URL}/rest/v1/${path}`, { ...init, headers, cache: "no-store" });
}

async function readJson(res: Response): Promise<Row[]> {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Supabase ${res.status}: ${text.slice(0, 300)}`);
  }
  if (!text.trim()) return [];
  const data = JSON.parse(text);
  return Array.isArray(data) ? data : [data];
}

/** Newest first. `owner` scoping is applied here, never by the caller. */
export async function listContent(
  owner: string,
  limit = 100
): Promise<ContentRecord[]> {
  const q = new URLSearchParams({
    owner_email: `eq.${owner}`,
    order: "created_at.desc",
    limit: String(Math.min(Math.max(limit, 1), 500)),
    select: "*",
  });
  const rows = await readJson(await rest(`${TABLE}?${q}`));
  return rows.map(toRecord);
}

export async function getContent(
  owner: string,
  id: string
): Promise<ContentRecord | null> {
  const q = new URLSearchParams({
    owner_email: `eq.${owner}`,
    id: `eq.${id}`,
    select: "*",
    limit: "1",
  });
  const rows = await readJson(await rest(`${TABLE}?${q}`));
  return rows.length ? toRecord(rows[0]) : null;
}

export interface SaveInput {
  id: string;
  topic: string;
  contentType?: string;
  platform?: string | null;
  design?: string | null;
  theme?: string | null;
  slides: Slide[];
  images?: string[];
  dimensions?: ContentRecord["dimensions"];
  template?: ContentRecord["template"];
  geoScore?: number | null;
  status?: string;
  aiGenerated?: boolean;
}

/**
 * Insert or update. Upsert keeps the editor simple: saving an edited piece is
 * the same call as creating it, so there is no create/update branch to get
 * wrong, and re-saving is idempotent.
 */
export async function saveContent(
  owner: string,
  input: SaveInput
): Promise<ContentRecord> {
  const body = {
    id: input.id,
    owner_email: owner,
    topic: input.topic,
    content_type: input.contentType ?? "carousel",
    platform: input.platform ?? null,
    design: input.design ?? null,
    theme: input.theme ?? null,
    slides: input.slides ?? [],
    images: input.images ?? [],
    dimensions: input.dimensions ?? null,
    template: input.template ?? null,
    geo_score: input.geoScore ?? null,
    status: input.status ?? "draft",
    ai_generated: input.aiGenerated ?? false,
  };

  const res = await rest(`${TABLE}?on_conflict=id`, {
    method: "POST",
    body: JSON.stringify(body),
    prefer: "resolution=merge-duplicates,return=representation",
  });
  const rows = await readJson(res);
  return toRecord(rows[0] ?? body);
}

export async function deleteContent(owner: string, id: string): Promise<boolean> {
  const q = new URLSearchParams({ owner_email: `eq.${owner}`, id: `eq.${id}` });
  const res = await rest(`${TABLE}?${q}`, {
    method: "DELETE",
    prefer: "return=representation",
  });
  const rows = await readJson(res);
  return rows.length > 0;
}

/**
 * Bulk import, used once per browser to carry a localStorage library onto the
 * server. Existing ids are merged rather than duplicated, so running it twice
 * is harmless.
 */
export async function importContent(
  owner: string,
  items: SaveInput[]
): Promise<number> {
  if (items.length === 0) return 0;
  const body = items.map((input) => ({
    id: input.id,
    owner_email: owner,
    topic: input.topic,
    content_type: input.contentType ?? "carousel",
    platform: input.platform ?? null,
    design: input.design ?? null,
    theme: input.theme ?? null,
    slides: input.slides ?? [],
    images: input.images ?? [],
    dimensions: input.dimensions ?? null,
    template: input.template ?? null,
    geo_score: input.geoScore ?? null,
    status: input.status ?? "draft",
    ai_generated: input.aiGenerated ?? false,
  }));

  const res = await rest(`${TABLE}?on_conflict=id`, {
    method: "POST",
    body: JSON.stringify(body),
    prefer: "resolution=merge-duplicates,return=representation",
  });
  const rows = await readJson(res);
  return rows.length;
}
