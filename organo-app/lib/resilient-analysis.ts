import type { AnalysisResult } from "@/types/analyze";
import { analyzeWebsite as runPrimaryAnalysis } from "@/lib/analyzer";
import { analyzeWithPageSpeed } from "@/lib/pagespeed";
import { normalizeUrl } from "@/lib/security";

export async function runResilientAnalysis(input: string): Promise<AnalysisResult> {
  try {
    return await runPrimaryAnalysis(input);
  } catch (error) {
    return analyzeWithPageSpeed(normalizeUrl(input), error);
  }
}
