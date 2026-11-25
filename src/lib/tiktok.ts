// TikTok Content Posting API (v2).
//
// TikTok is not reachable through the generic social connector, so it gets a
// native client. Two things make this API different from the others:
//
//  1. A direct post must be preceded by a creator_info query. That call returns
//     the creator's current privacy options and posting limits, and TikTok
//     rejects a publish whose privacy level was not offered there.
//  2. Publishing is asynchronous. The init call returns a publish_id and the
//     post appears later, so "accepted" is not the same as "published".
//
// Docs: https://developers.tiktok.com/doc/content-posting-api-get-started

const API = "https://open.tiktokapis.com/v2";

export type TikTokPrivacy =
  | "PUBLIC_TO_EVERYONE"
  | "MUTUAL_FOLLOW_FRIENDS"
  | "FOLLOWER_OF_CREATOR"
  | "SELF_ONLY";

export interface TikTokCreatorInfo {
  nickname: string;
  privacyOptions: TikTokPrivacy[];
  maxVideoDurationSec: number;
  commentDisabled: boolean;
  duetDisabled: boolean;
  stitchDisabled: boolean;
}

export interface TikTokPublishResult {
  ok: boolean;
  publishId?: string;
  /** TikTok accepted the job; the post is processed asynchronously. */
  status?: "accepted";
  error?: string;
  /** Set when the integration simply is not configured yet. */
  notConfigured?: boolean;
}

export function isTikTokConfigured(): boolean {
  return Boolean((process.env.TIKTOK_ACCESS_TOKEN || "").trim());
}

function token(): string {
  return (process.env.TIKTOK_ACCESS_TOKEN || "").trim();
}

async function call(
  path: string,
  body: Record<string, unknown>
): Promise<{ ok: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(body),
    });

    const json = (await res.json().catch(() => ({}))) as {
      data?: Record<string, unknown>;
      error?: { code?: string; message?: string };
    };

    // TikTok returns HTTP 200 with an error object, so the body decides.
    const code = json.error?.code;
    if (code && code !== "ok") {
      return { ok: false, error: `${code}: ${json.error?.message || "unknown error"}` };
    }
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    return { ok: true, data: json.data || {} };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}

/**
 * Required before any direct post: tells us which privacy levels this creator
 * may actually use, and whether comments/duet/stitch are available.
 */
export async function getCreatorInfo(): Promise<
  { ok: true; info: TikTokCreatorInfo } | { ok: false; error: string }
> {
  const r = await call("/post/publish/creator_info/query/", {});
  if (!r.ok) return { ok: false, error: r.error || "creator_info failed" };

  const d = (r.data || {}) as Record<string, unknown>;
  return {
    ok: true,
    info: {
      nickname: String(d.creator_nickname || ""),
      privacyOptions: (Array.isArray(d.privacy_level_options)
        ? d.privacy_level_options
        : []) as TikTokPrivacy[],
      maxVideoDurationSec: Number(d.max_video_post_duration_sec || 0),
      commentDisabled: Boolean(d.comment_disabled),
      duetDisabled: Boolean(d.duet_disabled),
      stitchDisabled: Boolean(d.stitch_disabled),
    },
  };
}

interface PostOptions {
  caption: string;
  /** Publicly reachable URL. The domain must be verified with TikTok. */
  videoUrl?: string;
  /** One or more image URLs — TikTok treats these as a photo carousel. */
  imageUrls?: string[];
  privacy?: TikTokPrivacy;
  /** Leave as a draft in the TikTok app instead of posting straight away. */
  draft?: boolean;
}

/**
 * Publish a video or a photo post.
 *
 * `draft: true` uploads to the creator's TikTok inbox for them to finish and
 * post by hand. That path needs no content audit, so it is the reliable choice
 * for a new integration; a direct post requires an approved, audited app.
 */
export async function postToTikTok(opts: PostOptions): Promise<TikTokPublishResult> {
  if (!isTikTokConfigured()) {
    return {
      ok: false,
      notConfigured: true,
      error:
        "TikTok אינו מחובר. הגדר TIKTOK_ACCESS_TOKEN ואמת את הדומיין של התמונות מול TikTok.",
    };
  }

  const caption = (opts.caption || "").slice(0, 2200);
  const images = (opts.imageUrls || []).filter(Boolean);

  if (!opts.videoUrl && images.length === 0) {
    return { ok: false, error: "צריך videoUrl או imageUrls כדי לפרסם בטיקטוק" };
  }

  // Draft ("inbox") vs direct post are different endpoints entirely.
  const endpoint = opts.draft
    ? "/post/publish/inbox/video/init/"
    : opts.videoUrl
      ? "/post/publish/video/init/"
      : "/post/publish/content/init/";

  let body: Record<string, unknown>;

  if (opts.videoUrl) {
    const source = { source: "PULL_FROM_URL", video_url: opts.videoUrl };
    body = opts.draft
      ? { source_info: source }
      : {
          post_info: {
            title: caption,
            privacy_level: opts.privacy || "SELF_ONLY",
            disable_comment: false,
            disable_duet: false,
            disable_stitch: false,
          },
          source_info: source,
        };
  } else {
    body = {
      media_type: "PHOTO",
      post_mode: opts.draft ? "MEDIA_UPLOAD" : "DIRECT_POST",
      post_info: {
        title: caption.slice(0, 90),
        description: caption,
        privacy_level: opts.privacy || "SELF_ONLY",
      },
      source_info: {
        source: "PULL_FROM_URL",
        photo_cover_index: 0,
        photo_images: images,
      },
    };
  }

  const r = await call(endpoint, body);
  if (!r.ok) return { ok: false, error: r.error };

  return {
    ok: true,
    status: "accepted",
    publishId: String((r.data as Record<string, unknown>)?.publish_id || ""),
  };
}

/** Poll the status of a publish job. */
export async function getPublishStatus(publishId: string) {
  const r = await call("/post/publish/status/fetch/", { publish_id: publishId });
  if (!r.ok) return { ok: false as const, error: r.error };
  const d = (r.data || {}) as Record<string, unknown>;
  return {
    ok: true as const,
    status: String(d.status || "UNKNOWN"),
    failReason: d.fail_reason ? String(d.fail_reason) : undefined,
    publicPostId: Array.isArray(d.publicaly_available_post_id)
      ? String(d.publicaly_available_post_id[0])
      : undefined,
  };
}
