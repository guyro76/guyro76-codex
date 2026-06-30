import type { AnalysisResult } from "@/types/analyze";
import { analyzeWebsite as runPrimaryAnalysis } from "@/lib/analyzer";
import { analyzeWithPageSpeed } from "@/lib/pagespeed";
import { normalizeUrl } from "@/lib/security";

type FallbackOutcome = { result?: AnalysisResult; error?: unknown };

export async function runResilientAnalysis(input: string): Promise<AnalysisResult> {
  const target = normalizeUrl(input);
  let fallbackPromise: Promise<FallbackOutcome> | undefined;

  const startFallback = (reason: unknown): Promise<FallbackOutcome> => {
    if (!fallbackPromise) {
      fallbackPromise = analyzeWithPageSpeed(target, reason)
        .then((result) => ({ result }))
        .catch((error) => ({ error }));
    }
    return fallbackPromise;
  };

  const fallbackTimer = setTimeout(() => {
    void startFallback(new Error("הסריקה הישירה התעכבה או נחסמה"));
  }, 8_000);

  try {
    const result = await runPrimaryAnalysis(input);
    clearTimeout(fallbackTimer);
    return result;
  } catch (primaryError) {
    clearTimeout(fallbackTimer);
    const outcome = await startFallback(primaryError);
    if (outcome.result) return outcome.result;
    if (outcome.error instanceof Error) throw outcome.error;
    throw new Error("לא ניתן היה להשלים את הסריקה");
  }
}
