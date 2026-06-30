import { createClient } from "@supabase/supabase-js";
import type { AnalysisResult } from "@/types/analyze";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function saveScan(sessionId: string, result: AnalysisResult): Promise<boolean> {
  const supabase = adminClient();
  if (!supabase) return false;
  const { error } = await supabase.from("scans").insert({
    session_id: sessionId,
    url: result.url,
    final_url: result.finalUrl,
    overall_score: result.scores.overall,
    seo_score: result.scores.seo,
    geo_score: result.scores.geo,
    aeo_score: result.scores.aeo,
    performance_score: result.scores.performance,
    result,
  });
  return !error;
}

export async function loadHistory(sessionId: string) {
  const supabase = adminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("scans")
    .select("id,url,final_url,overall_score,seo_score,geo_score,aeo_score,performance_score,created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return [];
  return data ?? [];
}
