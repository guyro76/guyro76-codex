export function supabaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
}

export function supabasePublicKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ""
  ).trim();
}

export function supabaseServiceKey(): string {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "").trim();
}

export function isSupabaseAuthConfigured(): boolean {
  return Boolean(supabaseUrl() && supabasePublicKey());
}
