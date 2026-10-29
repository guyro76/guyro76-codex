// Non-secret public Supabase client configuration.
// Per Supabase, sb_publishable_ keys are safe to ship in browser bundles.
// Never put service_role, sb_secret_ or privileged access tokens in frontend code.
// Environment values, when the deployment platform allows them, take precedence.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ueswnbbyxytvmjydvvwv.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_-IKfG4ZAdvhDBiGgFVlYPg_5Om9HWWX";
