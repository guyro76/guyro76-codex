import type { AnalysisResult } from "@/types/analyze";
import { analyzeWebsite as runPrimaryAnalysis } from "@/lib/analyzer";
import { analyzeWithPageSpeed } from "@/lib/pagespeed";
import { normalizeUrl } from "@/lib/security";

type FallbackOutcome = { result?: AnalysisResult; error?: unknown };

export async function runResilientAnalysis(input: string): Promise<AnalysisResult> {
  const target = normalizeUrl(input);
  let fallbackPromise: Promise<FallbackOutcome> | null = null;

  const fallbackTimer = setTimeout(() => {
    fallbackPromise = analyzeWithPageSpeed(target, new Error("הסריקה הישירה התעכבה או נחסמה"))
      .then((result) => ({ result }))
      .catch((error) => ({ error }));
  }, 8_000);

  try {
    const result = await runPrimaryAnalysis(input);
    clearTimeout(fallbackTimer);
    return result;
  } catch (primaryError) {
    clearTimeout(fallbackTimer);

    if (fallbackPromise) {
      const outcome = await fallbackPromise;
      if (outcome.result) return outcome.result;
      if (outcome.error instanceof Error) throw outcome.error;
    }

    return analyzeWithPageSpeed(target, primaryError);
  }
}
