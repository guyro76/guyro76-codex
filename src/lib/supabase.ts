// Supabase configuration.
// The project URL and anon/publishable key are PUBLIC by design (safe to ship
// to the browser), so we embed them as fallback defaults. This lets auth work
// on the live deployment even before env vars are configured in the host.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://polhdnfjvvlgszsnnuor.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_htSlaRn-yAVKanGxXr8Ywg_-hnCajMA";

type SupabaseUser = {
  id: string;
  email: string;
  user_metadata?: { name?: string; full_name?: string };
};

/**
 * Sign in with email + password against Supabase Auth.
 * Returns the user on success, or null on invalid credentials.
 */
export async function supabaseSignIn(
  email: string,
  password: string
): Promise<SupabaseUser | null> {
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  if (!data?.user) return null;
  return data.user as SupabaseUser;
}

/**
 * Register a new user with email + password in Supabase Auth.
 * Returns { ok: true } on success, or { ok: false, error } on failure.
 */
export async function supabaseSignUp(
  email: string,
  password: string,
  name?: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      data: name ? { name, full_name: name } : undefined,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      ok: false,
      error: data?.msg || data?.error_description || "הרשמה נכשלה",
    };
  }

  return { ok: true };
}
