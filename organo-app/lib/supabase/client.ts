"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabasePublicKey, supabaseUrl } from "@/lib/supabase/env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  const url = supabaseUrl();
  const key = supabasePublicKey();
  if (!url || !key) throw new Error("Supabase Auth is not configured");
  if (!browserClient) browserClient = createBrowserClient(url, key);
  return browserClient;
}
