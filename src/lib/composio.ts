// Composio REST integration.
//
// The deployed app posts to social networks by calling Composio's HTTP API
// server-side (the MCP tools are only available to the assistant, not to the
// running app). This requires two environment variables in the host (Vercel):
//
//   COMPOSIO_API_KEY   – from https://app.composio.dev  (Settings → API Keys)
//   COMPOSIO_USER_ID   – the entity/user id whose accounts are connected
//                        (defaults to "default" if you connected under that)
//
// Each network's posting action has a different slug + argument shape. Those
// defaults live in PLATFORM_ACTIONS below and can be overridden per-network
// with env vars (e.g. COMPOSIO_ACTION_LINKEDIN) without touching code, so the
// exact slug for your Composio account can be set without a redeploy of logic.

const COMPOSIO_BASE = "https://backend.composio.dev/api/v3";

export const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY || "";
export const COMPOSIO_USER_ID = process.env.COMPOSIO_USER_ID || "default";

export function isComposioConfigured(): boolean {
  return COMPOSIO_API_KEY.trim().length > 0;
}

// Default Composio action slugs per network. Override via env if your account
// exposes different slugs. TikTok is intentionally absent — it is not connected.
export const PLATFORM_ACTIONS: Record<string, string> = {
  linkedin:
    process.env.COMPOSIO_ACTION_LINKEDIN || "LINKEDIN_CREATE_LINKED_IN_POST",
  facebook:
    process.env.COMPOSIO_ACTION_FACEBOOK || "FACEBOOK_CREATE_PAGE_POST",
  instagram:
    process.env.COMPOSIO_ACTION_INSTAGRAM || "INSTAGRAM_CREATE_POST",
};

export interface ComposioResult {
  successful: boolean;
  data?: unknown;
  error?: string | null;
}

/**
 * Execute a single Composio tool/action for the connected user.
 * Returns Composio's response verbatim (successful flag + data/error) so the
 * caller can surface real outcomes — never a fabricated success.
 */
export async function executeComposioTool(
  slug: string,
  args: Record<string, unknown>,
  userId: string = COMPOSIO_USER_ID
): Promise<ComposioResult> {
  if (!isComposioConfigured()) {
    return { successful: false, error: "COMPOSIO_API_KEY is not configured" };
  }

  try {
    const res = await fetch(
      `${COMPOSIO_BASE}/tools/execute/${encodeURIComponent(slug)}`,
      {
        method: "POST",
        headers: {
          "x-api-key": COMPOSIO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, arguments: args }),
      }
    );

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        successful: false,
        error:
          json?.error ||
          json?.message ||
          `Composio returned HTTP ${res.status}`,
      };
    }

    // Composio wraps results as { successful, data, error }.
    return {
      successful: json?.successful ?? true,
      data: json?.data,
      error: json?.error ?? null,
    };
  } catch (err) {
    return {
      successful: false,
      error: err instanceof Error ? err.message : "Composio request failed",
    };
  }
}

/**
 * Build the argument payload for a network's post action. Networks differ in
 * field names; this maps our generic { caption, imageUrl } to each action's
 * most common shape. Adjust here if your Composio action expects other fields.
 */
export function buildPostArguments(
  platform: string,
  caption: string,
  imageUrl?: string
): Record<string, unknown> {
  switch (platform) {
    case "linkedin":
      return {
        text: caption,
        ...(imageUrl ? { media_url: imageUrl } : {}),
        visibility: "PUBLIC",
      };
    case "facebook":
      return {
        message: caption,
        ...(imageUrl ? { link: imageUrl } : {}),
      };
    case "instagram":
      return {
        caption,
        ...(imageUrl ? { image_url: imageUrl } : {}),
      };
    default:
      return { text: caption, ...(imageUrl ? { image_url: imageUrl } : {}) };
  }
}

export interface PlatformPostResult {
  platform: string;
  successful: boolean;
  error?: string | null;
  actionSlug: string;
}

/**
 * Post the given caption + optional image to each requested platform via
 * Composio. Returns one honest result per platform (real success/error).
 */
export async function postToPlatforms(
  platforms: string[],
  caption: string,
  imageUrl: string | undefined,
  userId: string = COMPOSIO_USER_ID
): Promise<PlatformPostResult[]> {
  const results = await Promise.all(
    platforms.map(async (platform): Promise<PlatformPostResult> => {
      const slug = PLATFORM_ACTIONS[platform];
      if (!slug) {
        return {
          platform,
          successful: false,
          error: `אין פעולת פרסום מוגדרת עבור ${platform} (לא מחובר ב-Composio)`,
          actionSlug: "",
        };
      }
      const args = buildPostArguments(platform, caption, imageUrl);
      const result = await executeComposioTool(slug, args, userId);
      return {
        platform,
        successful: result.successful,
        error: result.error,
        actionSlug: slug,
      };
    })
  );
  return results;
}
