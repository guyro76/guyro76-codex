import { offlineQuestions } from './offlineQuestions.ts';
import { englishQuestions } from './englishQuestions.ts';
import { internationalQuestions } from './internationalQuestions.ts';
import { spanishQuestions } from './spanishQuestions.ts';
import { languageQuestions } from './languageQuestions.ts';
import { freshLocalQuestionReserve } from './freshQuestions.ts';

export type LocalAnswerKey = { id: number; correct: number };

/** Every bundled bank a local question can be served from. The answer lookup must
 *  cover exactly the banks the question picker draws from — when it did not
 *  (language and Spanish banks were missing), tapping an answer silently did nothing. */
export const bundledQuestionBanks: readonly (readonly LocalAnswerKey[])[] = [
  englishQuestions, offlineQuestions, freshLocalQuestionReserve,
  internationalQuestions, spanishQuestions, languageQuestions,
];

export function findLocalQuestion<T extends LocalAnswerKey>(id: number | undefined, extra: readonly T[] = []): LocalAnswerKey | T | undefined {
  if (typeof id !== 'number') return undefined;
  for (const bank of bundledQuestionBanks) {
    const hit = bank.find(q => q.id === id);
    if (hit) return hit;
  }
  return extra.find(q => q.id === id);
}
